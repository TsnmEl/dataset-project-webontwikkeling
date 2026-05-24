import { Collection, MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { Agent, Role, RoleCounts, User } from './types';

const MONGO_URI = 'mongodb+srv://apuser:8ufZNNX4MFvZcYsq@ap-cluster.da11kni.mongodb.net/?appName=ap-cluster';
const AGENTS_URL = 'https://raw.githubusercontent.com/TsnmEl/dataset-project-webontwikkeling/refs/heads/main/data/agents.json';
const ROLES_URL = 'https://raw.githubusercontent.com/TsnmEl/dataset-project-webontwikkeling/refs/heads/main/data/roles.json';
const SALT_ROUNDS = 10;

export const client = new MongoClient(MONGO_URI);

export const agentsCollection:Collection<Agent> = client.db('Valorant').collection<Agent>('Agents');
export const rolesCollection:Collection<Role> = client.db('Valorant').collection<Role>('Roles');
export const usersCollection:Collection<User> = client.db('Valorant').collection<User>('Users');

async function seed(): Promise<void> {
    if (await agentsCollection.countDocuments() === 0) {
        const res    = await fetch(AGENTS_URL);
        const agents: Agent[] = await res.json();
        await agentsCollection.insertMany(agents as any[]);
        console.log(`[db] ${agents.length} agents opgeslagen [✓]`);
    } else {
        console.log('[db] Agents al aanwezig [✓]');
    }

    if (await rolesCollection.countDocuments() === 0) {
        console.log('[db] Roles ophalen...');
        const res  = await fetch(ROLES_URL);
        const roles: Role[] = await res.json();
        await rolesCollection.insertMany(roles as any[]);
        console.log(`[db] ${roles.length} roles opgeslagen [✓]`);
    } else {
        console.log('[db] Roles al aanwezig [✓]');
    }

    if (await usersCollection.countDocuments() === 0) {
        console.log('[db] Standaard gebruikers aanmaken...');
        const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
        const userHash  = await bcrypt.hash('user123',  SALT_ROUNDS);
        await usersCollection.insertMany([
            { username: 'admin', password: adminHash, role: 'ADMIN' },
            { username: 'user',  password: userHash,  role: 'USER'  },
        ]);
        console.log('[db] admin + user aangemaakt [✓]');
    } else {
        console.log('[db] Users al aanwezig [✓]');
    }
}

async function exit() {
    try {
        await client.close();
        console.log('[db] Verbinding verbroken [✓]');
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect(): Promise<void> {
    try {
        await client.connect();
        console.log('[db] Verbonden met MongoDB [✓]');
        await seed();
        process.on('SIGINT',  exit);
        process.on('SIGUSR2', exit);
    } catch (error) {
        console.error(error);
    }
}

export async function getAgents(): Promise<Agent[]> {
    return agentsCollection.find<Agent>({}).toArray();
}

export async function getRoles(): Promise<Role[]> {
    return rolesCollection.find<Role>({}).toArray();
}

export async function getRoleCounts(): Promise<RoleCounts> {
    const agents = await getAgents();
    const counts: RoleCounts = {};
    agents.forEach(a => { counts[a.role.name] = (counts[a.role.name] ?? 0) + 1; });
    return counts;
}

export async function getUsers(): Promise<Omit<User, 'password'>[]> {
    return usersCollection.find<User>({}, { projection: { password: 0 } }).toArray() as Promise<Omit<User, 'password'>[]>;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    return usersCollection.findOne<User>({ username });
}

export async function createUser(username: string, password: string): Promise<void> {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await usersCollection.insertOne({ username, password: hash, role: 'USER' });
}

export async function deleteUser(id: ObjectId): Promise<void> {
    await usersCollection.deleteOne({ _id: id });
}

export async function updateAgent(id: string, update: Partial<Agent>): Promise<void> {
    await agentsCollection.updateOne({ id }, { $set: update });
}