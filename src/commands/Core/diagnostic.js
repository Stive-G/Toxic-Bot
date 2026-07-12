import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getModuleSummary } from '../../config/modules.js';
import pkg from '../../../package.json' with { type: 'json' };

export default { data: new SlashCommandBuilder().setName('diagnostic').setDescription('Affiche l’état technique du bot').setDMPermission(false), category: 'Core', async execute(interaction) {
  const db = interaction.client.db?.getStatus?.() || {};
  const modules = getModuleSummary();
  const ping = interaction.client.ws?.ping;
  return InteractionHelper.safeReply(interaction, { embeds: [createEmbed({ title: 'Diagnostic Toxic Bot', color: 'primary', footer: 'Toxic Bot • Configuration', fields: [
    { name: 'Services', value: `Discord : ${interaction.client.isReady() ? '✅' : '⚠️'}\nPostgreSQL : ${db.isDegraded ? '🟠 mémoire' : '✅'}\nLavalink : ${interaction.client.riffy ? '✅' : '🟠'}\nModules : ✅ ${modules.enabled.length} actifs` },
    { name: 'Runtime', value: `Ping : ${Number.isFinite(ping) ? `${ping} ms` : 'N/A'}\nUptime : ${Math.floor(process.uptime() / 60)} min\nNode : ${process.version}\ndiscord.js : ${pkg.dependencies['discord.js']}\nCommandes : ${interaction.client.commands?.size || 0}\nComposants : ${(interaction.client.buttons?.size || 0) + (interaction.client.selectMenus?.size || 0) + (interaction.client.modals?.size || 0)}` },
  ] })], ephemeral: true });
} };
