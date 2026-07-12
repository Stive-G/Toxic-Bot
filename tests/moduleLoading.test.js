import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { assertCommandLimit, filterCommandFiles, getCommandCategory, loadCommands } from '../src/handlers/commandLoader.js';
import { isCategoryEnabled } from '../src/config/modules.js';
import { getActiveHelpCategories } from '../src/commands/Core/help.js';

test('enabled command categories are retained and disabled categories are skipped', () => {
  const commandsPath = path.join(process.cwd(), 'src', 'commands');
  const files = [
    path.join(commandsPath, 'Core', 'help.js'),
    path.join(commandsPath, 'Economy', 'balance.js'),
    path.join(commandsPath, 'Moderation', 'ban.js'),
  ];

  assert.deepEqual(
    filterCommandFiles(files, commandsPath).map((file) => getCommandCategory(commandsPath, file)),
    ['Core', 'Moderation'],
  );
  assert.equal(isCategoryEnabled('Core'), true);
  assert.equal(isCategoryEnabled('Core', { core: false }), true);
  assert.equal(isCategoryEnabled('Economy'), false);
  assert.equal(isCategoryEnabled('UnknownCategory'), false);
});

test('help only exposes categories represented by loaded commands', () => {
  const client = {
    commands: new Map([
      ['help', { category: 'Core' }],
      ['ban', { category: 'Moderation' }],
    ]),
  };

  assert.deepEqual(getActiveHelpCategories(client), ['Core', 'Moderation']);
});

test('the Discord command limit is enforced without truncating commands', () => {
  const commands = Array.from({ length: 101 }, (_, index) => ({ category: index % 2 ? 'Core' : 'Moderation' }));
  assert.throws(() => assertCommandLimit(commands), /exceeds Discord's 100-command limit/);
  assert.doesNotThrow(() => assertCommandLimit(commands.slice(0, 100)));
});

test('the loader does not register commands from disabled modules', async () => {
  const client = {};
  await loadCommands(client);

  assert.equal(client.commands.has('balance'), false);
  assert.equal(client.commands.has('birthday'), false);
  assert.equal(client.commands.has('ban'), true);
  assert.ok(client.commands.size <= 100);
});
