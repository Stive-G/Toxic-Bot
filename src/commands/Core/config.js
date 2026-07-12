import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import ConfigService from '../../services/configService.js';
import { getModuleSummary } from '../../config/modules.js';
import { isServerAdmin } from '../../utils/adminAccess.js';
import configWizard from './configWizard.js';
import pkg from '../../../package.json' with { type: 'json' };

export default {
  data: new SlashCommandBuilder().setName('config').setDescription('Affiche ou modifie la configuration').setDMPermission(false)
    .addSubcommand((sub) => sub.setName('show').setDescription('Affiche la configuration'))
    .addSubcommand((sub) => sub.setName('edit').setDescription('Ouvre les menus de modification'))
    .addSubcommand((sub) => sub.setName('reset').setDescription('Réinitialise la configuration').addBooleanOption((option) => option.setName('confirm').setDescription('Confirmer la réinitialisation').setRequired(true))),
  category: 'Core',
  async execute(interaction) {
    if (!isServerAdmin(interaction)) return InteractionHelper.safeReply(interaction, { content: 'Accès refusé.', flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'edit') return configWizard.execute(interaction);
    if (subcommand === 'reset') {
      if (!interaction.options.getBoolean('confirm')) return InteractionHelper.safeReply(interaction, { content: 'Réinitialisation annulée : confirmez avec `confirm: true`.', flags: MessageFlags.Ephemeral });
      if (!await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral })) return;
      await ConfigService.reset(interaction.client, interaction.guildId, null, interaction.user.id);
      return InteractionHelper.safeEditReply(interaction, { embeds: [createEmbed({ title: 'Configuration réinitialisée', description: 'Les réglages principaux ont été remis à zéro.', color: 'success', footer: 'Toxic Bot • Configuration' })] });
    }
    if (!await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral })) return;
    const config = await ConfigService.get(interaction.client, interaction.guildId);
    const modules = getModuleSummary();
    const db = interaction.client.db?.getStatus?.();
    return InteractionHelper.safeEditReply(interaction, { embeds: [createEmbed({ title: `Configuration — ${interaction.guild.name}`, color: 'primary', footer: 'Toxic Bot • Configuration', fields: [
      { name: 'Modules actifs', value: modules.enabled.join(', ').slice(0, 1024) },
      { name: 'Réglages', value: `Préfixe : \`${config.prefix || '!'}\`\nLogs : ${config.logging?.channels?.audit ? `<#${config.logging.channels.audit}>` : 'Non défini'}\nWelcome : ${config.welcomeChannel ? `<#${config.welcomeChannel}>` : 'Non défini'}\nTickets : ${config.ticketChannelId ? `<#${config.ticketChannelId}>` : 'Non défini'}` },
      { name: 'Système', value: `Version : ${pkg.version}\nBase : ${db?.isDegraded ? 'Mémoire' : 'PostgreSQL'}\nUptime : ${Math.floor(process.uptime() / 60)} min` },
    ] })] });
  },
};
