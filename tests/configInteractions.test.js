import assert from 'node:assert/strict';
import test from 'node:test';
import { PermissionFlagsBits } from 'discord.js';
import configCommand from '../src/commands/Core/config.js';
import configWizard from '../src/commands/Core/configWizard.js';
import { InteractionHelper } from '../src/utils/interactionHelper.js';

function createInteraction(overrides = {}) {
  const calls = { reply: 0, deferReply: 0, editReply: 0, followUp: 0, showModal: 0, deferUpdate: 0 };
  const interaction = {
    id: '123456789012345678',
    type: 2,
    createdTimestamp: Date.now(),
    user: { id: 'admin-id' },
    guildId: 'guild-id',
    deferred: false,
    replied: false,
    memberPermissions: { has: (permission) => permission === PermissionFlagsBits.Administrator },
    async reply() { calls.reply++; this.replied = true; },
    async deferReply() { calls.deferReply++; this.deferred = true; },
    async editReply() { calls.editReply++; this.replied = true; },
    async followUp() { calls.followUp++; },
    async showModal() { calls.showModal++; this.replied = true; },
    async deferUpdate() { calls.deferUpdate++; this.deferred = true; },
    ...overrides,
  };
  return { interaction, calls };
}

function createGuild(client) {
  return {
    id: 'guild-id',
    name: 'Toxic Guild',
    client,
    channels: { cache: new Map() },
    roles: { cache: new Map() },
  };
}

test('safeReply uses reply, editReply, or followUp according to acknowledgement state', async () => {
  const fresh = createInteraction();
  await InteractionHelper.safeReply(fresh.interaction, { content: 'fresh' });
  assert.deepEqual(fresh.calls, { reply: 1, deferReply: 0, editReply: 0, followUp: 0, showModal: 0, deferUpdate: 0 });

  const deferred = createInteraction({ deferred: true });
  await InteractionHelper.safeReply(deferred.interaction, { content: 'deferred' });
  assert.equal(deferred.calls.editReply, 1);
  assert.equal(deferred.calls.reply, 0);

  const replied = createInteraction({ replied: true });
  await InteractionHelper.safeReply(replied.interaction, { content: 'replied' });
  assert.equal(replied.calls.followUp, 1);
  assert.equal(replied.calls.editReply, 0);
});

test('safeDefer does not defer an interaction twice', async () => {
  const { interaction, calls } = createInteraction({ deferred: true });
  assert.equal(await InteractionHelper.safeDefer(interaction), true);
  assert.equal(calls.deferReply, 0);
});

test('/config show and reset acknowledge immediately without a collector', async () => {
  const saved = [];
  const client = {
    db: {
      get: async () => ({}),
      set: async (key, value) => saved.push({ key, value }),
      getStatus: () => ({ isDegraded: false }),
    },
    guilds: { cache: new Map() },
  };
  const guild = createGuild(client);
  client.guilds.cache.set(guild.id, guild);

  const show = createInteraction({ client, guild, options: { getSubcommand: () => 'show' } });
  await configCommand.execute(show.interaction);
  assert.equal(show.calls.deferReply, 1);
  assert.equal(show.calls.editReply, 1);
  assert.equal(show.calls.reply, 0);

  const reset = createInteraction({ client, guild, options: { getSubcommand: () => 'reset', getBoolean: () => true } });
  await configCommand.execute(reset.interaction);
  assert.equal(reset.calls.deferReply, 1);
  assert.equal(reset.calls.editReply, 1);
  assert.equal(reset.calls.reply, 0);
  assert.equal(saved.length, 1);
});

test('/config edit lets configWizard own the single initial response', async () => {
  const client = { db: { get: async () => ({}) }, guilds: { cache: new Map() }, config: { bot: { prefix: '!' } } };
  const guild = createGuild(client);
  client.guilds.cache.set(guild.id, guild);
  const edit = createInteraction({
    client,
    guild,
    options: { getSubcommand: () => 'edit' },
    async fetchReply() { return null; },
  });

  await configCommand.execute(edit.interaction);
  assert.equal(edit.calls.deferReply, 1);
  assert.equal(edit.calls.editReply, 1);
  assert.equal(edit.calls.reply, 0);
});

test('config wizard select shows one modal and an expired modal interaction receives no late response', async () => {
  let collect;
  const client = { db: { get: async () => ({}) }, guilds: { cache: new Map() }, config: { bot: { prefix: '!' } } };
  const guild = createGuild(client);
  client.guilds.cache.set(guild.id, guild);
  const root = createInteraction({
    client,
    guild,
    async fetchReply() {
      return {
        createMessageComponentCollector() {
          return { on(event, listener) { if (event === 'collect') collect = listener; } };
        },
      };
    },
  });

  await configWizard.execute(root.interaction);
  const select = createInteraction({
    type: 3,
    user: root.interaction.user,
    customId: 'config_select:guild-id',
    values: ['prefix'],
    isButton: () => false,
    isStringSelectMenu: () => true,
    async awaitModalSubmit() { return null; },
  });
  await collect(select.interaction);
  assert.equal(select.calls.showModal, 1);
  assert.equal(select.calls.deferUpdate, 0);

  const expired = createInteraction({ createdTimestamp: Date.now() - (16 * 60 * 1000) });
  assert.equal(await InteractionHelper.safeReply(expired.interaction, { content: 'late' }), false);
  assert.equal(expired.calls.reply, 0);
});
