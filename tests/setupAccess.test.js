import assert from 'node:assert/strict';
import test from 'node:test';
import { PermissionFlagsBits } from 'discord.js';
import setupCommand, { buildServerVerification } from '../src/commands/Core/setup.js';
import { isServerAdmin } from '../src/utils/adminAccess.js';
import { botConfig } from '../src/config/bot.js';

function interaction(userId, administrator = false) {
  return { user: { id: userId }, memberPermissions: { has: (permission) => administrator && permission === PermissionFlagsBits.Administrator } };
}

test('setup access accepts administrators and configured owners but rejects normal members', () => {
  const original = [...botConfig.commands.owners];
  botConfig.commands.owners = ['owner-id'];
  assert.equal(isServerAdmin(interaction('admin-id', true)), true);
  assert.equal(isServerAdmin(interaction('owner-id', false)), true);
  assert.equal(isServerAdmin(interaction('member-id', false)), false);
  botConfig.commands.owners = original;
});

test('setup command exposes start and verify subcommands without Discord permission gate', () => {
  const data = setupCommand.data.toJSON();
  assert.deepEqual(data.options.map((option) => option.name), ['start', 'verify']);
  assert.equal(data.default_member_permissions, undefined);
});

test('server verification builds a configuration embed', async () => {
  const embed = await buildServerVerification({
    guildId: 'guild-id',
    client: { db: { get: async () => ({}), getStatus: () => ({ isDegraded: false }) }, riffy: {}, guilds: { cache: new Map([['guild-id', { }]]) } },
    guild: { members: { me: { permissions: { has: () => true } } } },
  });
  assert.equal(embed.data.title, 'Vérification du serveur');
});
