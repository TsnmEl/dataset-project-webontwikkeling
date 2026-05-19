import express from 'express';
import ejs from 'ejs';
import { Agent, Role } from './types';
import path from 'path';

const app = express();

const AgentsUrl = 'https://raw.githubusercontent.com/TsnmEl/dataset-project-webontwikkeling/refs/heads/main/data/agents.json';
const RolesUrl = 'https://raw.githubusercontent.com/TsnmEl/dataset-project-webontwikkeling/refs/heads/main/data/roles.json';

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));
app.set('port', 3000);

app.get('/', (req,res) =>{
    res.redirect('/agents');
});

app.get('/agents', (req,res) =>{
    res.render('agents');
});

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);