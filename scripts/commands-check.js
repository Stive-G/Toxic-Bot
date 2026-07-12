import { loadCommands } from '../src/handlers/commandLoader.js';
import { getModuleSummary } from '../src/config/modules.js';

const client = {};
await loadCommands(client);

const modules = getModuleSummary();
console.log(`Enabled modules: ${modules.enabled.length} (${modules.enabled.join(', ')})`);
console.log(`Disabled modules: ${modules.disabled.length} (${modules.disabled.join(', ')})`);
console.log(`Active slash commands: ${client.commands.size}`);
console.log('Discord command limit: 100');
console.log(client.commands.size <= 100 ? 'Status: OK' : 'Status: ERROR');

if (client.commands.size > 100) process.exitCode = 1;
