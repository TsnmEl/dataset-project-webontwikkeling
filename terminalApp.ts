import readline from 'readline-sync';
import agents from './data/agents.json';

let running = true;

while (running) {
    console.log('\nWelcome to the JSON data viewer!\n');
    const choice = readline.keyInSelect(
        ['View all data', 'Filter by ID', 'Exit'],
        '\nPlease enter your choice: '
    );

    if (choice === 0) {
        agents.forEach((agent) => {
        console.log(`- ${agent.name} (${agent.id})`);
        });
    } 
    
    else if (choice === 1) {
        const id = readline.question('Please enter the ID you want to filter by: ');
        console.log();
        const agent = agents.find((a) => a.id === id);

        if (agent) {
            console.log(`- ${agent.name} (${agent.id})`);
            console.log(`  - Agent number: ${agent.agentNumber}`);
            console.log(`  - Description: ${agent.description}`);
            console.log(`  - Origin: ${agent.origin}`);
            console.log(`  - Is human: ${agent.isHuman}`);
            console.log(`  - Release date: ${agent.releaseDate}`);
            console.log(`  - Image: ${agent.imageUrl}`);
            console.log(`  - Full image: ${agent.fullImageUrl}`);
            console.log(`  - Difficulty: ${agent.difficulty}`);
            console.log(`  - Abilities: ${agent.abilities}`);
            console.log(`  - Role:`);
            console.log(`    - ID: ${agent.role.id}`);
            console.log(`    - Name: ${agent.role.name}`);
            console.log(`    - Playstyle: ${agent.role.playstyle}`);
            console.log(`    - Icon: ${agent.role.iconUrl}`);
        } else {
            console.log('No agent found matching this ID. Please try again.\n');
        }
    } 
    
    else {
        running = false;
    }
}