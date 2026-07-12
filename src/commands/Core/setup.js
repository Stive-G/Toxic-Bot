import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import ConfigService from '../../services/configService.js';
import { getModuleSummary } from '../../config/modules.js';
import { isServerAdmin } from '../../utils/adminAccess.js';

function setupEmbed(configured) {
  return createEmbed({
    title: 'Bienvenue dans Toxic Bot',
    description: configured ? 'Le serveur est déjà configuré. Que souhaitez-vous faire ?' : 'Le serveur n’est pas encore configuré. Que souhaitez-vous faire ?',
    color: 'primary', footer: 'Toxic Bot • Configuration',
    fields: [{ name: 'Options', value: '• Configuration rapide\n• Configuration avancée\n• Vérifier le serveur' }],
  });
}

export default {
  data: new SlashCommandBuilder().setName('setup').setDescription('Ouvre l’assistant de configuration').setDMPermission(false)
    .addSubcommand((sub) => sub.setName('verify').setDescription('Vérifie la configuration du serveur'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Core',
  async execute(interaction) {
    if (!isServerAdmin(interaction)) return InteractionHelper.safeReply(interaction, { embeds: [createEmbed({ title: 'Accès refusé', description: 'Seuls les administrateurs peuvent configurer le bot.', color: 'error' })], ephemeral: true });
    if (interaction.options.getSubcommand(false) === 'verify') {
      const config = await ConfigService.get(interaction.client, interaction.guildId);
      const modules = getModuleSummary();
      const database = interaction.client.db?.getStatus?.();
      const fields = [
        { name: 'Permissions', value: interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels) ? '✅ Manage Channels' : '❌ Permission manquante : Manage Channels' },
        { name: 'Configuration', value: `Logs : ${config.logging?.channels?.audit ? '✅' : '⚠️'}\nWelcome : ${config.welcomeChannel ? '✅' : '⚠️'}\nRôle modérateur : ${config.modRole ? '✅' : '⚠️'}` },
        { name: 'Services', value: `Base : ${database?.isDegraded ? '⚠️ mémoire' : '✅ PostgreSQL'}\nLavalink : ${interaction.client.riffy ? '✅ disponible' : '⚠️ indisponible'}\nModules actifs : ${modules.enabled.length}` },
      ];
      return InteractionHelper.safeReply(interaction, { embeds: [createEmbed({ title: 'Vérification du serveur', color: 'primary', footer: 'Toxic Bot • Configuration', fields })], ephemeral: true });
    }
    const configured = await ConfigService.exists(interaction.client, interaction.guildId);
    const quick = new ButtonBuilder().setCustomId('setup-quick').setLabel('Configuration rapide').setStyle(ButtonStyle.Success);
    const advanced = new ButtonBuilder().setCustomId('setup-advanced').setLabel('Configuration avancée').setStyle(ButtonStyle.Secondary);
    const verify = new ButtonBuilder().setCustomId('setup-verify').setLabel('Vérifier le serveur').setStyle(ButtonStyle.Primary);
    await InteractionHelper.safeReply(interaction, { embeds: [setupEmbed(configured)], components: [new ActionRowBuilder().addComponents(quick, advanced, verify)], ephemeral: true });
  },
};
