import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { ObjectId } from 'mongodb';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { AbilityVideos } from './data';
import { connect, getAgents, getRoles, getRoleCounts, getUsers, getUserByUsername, createUser, deleteUser, updateAgent } from './database';

declare module 'express-session' {
    interface SessionData {
        user?: { username: string; role: string };
    }
}

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));
app.set('port', process.env.PORT || 3000);

app.use(session({
    secret: 'valorant-secret-key-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

function roleClass(r: string): string {
    return ({ Duelist: 'role-duelist', Controller: 'role-controller', Sentinel: 'role-sentinel', Initiator: 'role-initiator' } as Record<string, string>)[r] ?? 'role-initiator';
}

function roleColor(r: string): string {
    return ({ Duelist: 'var(--duelist)', Controller: 'var(--controller)', Sentinel: 'var(--sentinel)', Initiator: 'var(--initiator)' } as Record<string, string>)[r] ?? 'var(--initiator)';
}

const requireLogin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) { res.redirect('/login'); return; }
    next();
};

const requireGuest = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user) { res.redirect('/home'); return; }
    next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) { res.redirect('/login'); return; }
    if (req.session.user.role !== 'ADMIN') { res.status(403).send('Geen toegang — alleen admins.'); return; }
    next();
};

app.get('/', (_req, res) => res.redirect('/home'));

/* LOGIN */
app.get('/login', requireGuest, (_req, res) => {
    res.render('login', { error: null });
});

app.post('/login', requireGuest, async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return res.render('login', { error: 'Ongeldige gebruikersnaam of wachtwoord.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render('login', { error: 'Ongeldige gebruikersnaam of wachtwoord.' });
        }
        req.session.user = { username: user.username, role: user.role };
        res.redirect('/home?welcome=1');
    } catch (err) {
        console.error(err);
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

app.get('/register', requireGuest, (_req, res) => {
    res.render('register', { error: null });
});

app.post('/register', requireGuest, async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };
    try {
        const existing = await getUserByUsername(username);
        if (existing) {
            return res.render('register', { error: 'Gebruikersnaam is al in gebruik.' });
        }
        await createUser(username, password);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
    }
});

/* HOME */
app.get('/home', requireLogin, async (req, res) => {
    try {
        let agents = await getAgents();
        const roles = await getRoles();
        const roleCounts = await getRoleCounts();

        const search = (req.query.search as string) ?? '';
        const roleFilter = (req.query.role as string) ?? 'all';
        const sortKey = (req.query.sort   as string) ?? 'name';
        const sortDir = req.query.dir === 'desc' ? -1 : 1;

        if (search)
            agents = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
        if (roleFilter !== 'all')
            agents = agents.filter(a => a.role.name === roleFilter);

        agents.sort((a, b) => {
            const va = sortKey === 'releaseDate' ? new Date(a.releaseDate).getTime() : (a as any)[sortKey];
            const vb = sortKey === 'releaseDate' ? new Date(b.releaseDate).getTime() : (b as any)[sortKey];
            return (va < vb ? -1 : va > vb ? 1 : 0) * sortDir;
        });

        res.render('index', { agents, roles, roleCounts, search, roleFilter, sortKey, sortDir, roleClass, roleColor, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* AGENTS */
app.get('/agents', requireLogin, async (req, res) => {
    try {
        let agents = await getAgents();
        const search = (req.query.search as string) ?? '';
        if (search)
            agents = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
        res.render('agents', { agents, search, roleClass, roleColor, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* AGENT DETAIL */
app.get('/agents/:id', requireLogin, async (req, res) => {
    try {
        const agents  = await getAgents();
        const paramId = req.params.id as string;
        const agent   = agents.find(a => a.id === paramId || a.name.toLowerCase() === paramId.toLowerCase());
        if (!agent) return res.status(404).send('Agent niet gevonden');
        res.render('agent-detail', { agent, roleClass, roleColor, abilityVideos: AbilityVideos, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* AGENT EDIT */
app.post('/agents/:id/edit', requireAdmin, async (req, res) => {
    try {
        const { description, origin, difficulty, beginnerFriendly, roleName } = req.body;
        const roles = await getRoles();
        const role  = roles.find(r => r.name === roleName);

        const update: any = { description, origin, difficulty, beginnerFriendly: beginnerFriendly === 'true' };
        if (role) update.role = role;

        await updateAgent(req.params.id as string, update);
        res.redirect('/agents/' + req.params.id);
    } catch (err) {
        console.error(err);
    }
});

/* ROLES */
app.get('/roles', requireLogin, async (req, res) => {
    try {
        const roles      = await getRoles();
        const roleCounts = await getRoleCounts();
        res.render('roles', { roles, roleCounts, roleClass, roleColor, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* ROLE DETAIL */
app.get('/roles/:name', requireLogin, async (req, res) => {
    try {
        const roles     = await getRoles();
        const agents    = await getAgents();
        const paramName = req.params.name as string;
        const role      = roles.find(r => r.name.toLowerCase() === paramName.toLowerCase());
        if (!role) return res.status(404).send('Role niet gevonden');
        const roleAgents = agents.filter(a => a.role.name === role.name);
        res.render('role-detail', { role, roleAgents, roleClass, roleColor, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* USERS */
app.get('/users', requireLogin, async (req, res) => {
    try {
        const allUsers = await getUsers();
        res.render('users', { allUsers, currentUser: req.session.user });
    } catch (err) {
        console.error(err);
    }
});

/* USER DELETE */
app.post('/users/:id/delete', requireAdmin, async (req, res) => {
    try {
        await deleteUser(new ObjectId(req.params.id as string));
        res.redirect('/users');
    } catch (err) {
        console.error(err);
    }
});

/* SERVER */
app.listen(app.get('port'), async () => {
    await connect();
    console.log('[server] http://localhost:' + app.get('port'));
});