import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import ConfigService from '../../services/configService.js';
import { getModuleSummary } from '../../config/modules.js';
import { isServerAdmin } from '../../utils/adminAccess.js';

export async function buildServerVerification(interaction) {
  const config = await ConfigService.get(interaction.client, interaction.guildId);
  const modules = getModuleSummary();
  const database = interaction.client.db?.getStatus?.();
  return createEmbed({ title: 'Vérification du serveur', color: 'primary', footer: 'Toxic Bot • Configuration', fields: [
    { name: 'Permissions', value: interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels) ? '✅ Manage Channels' : '❌ Permission manquante : Manage Channels' },
    { name: 'Configuration', value: `Logs : ${config.logging?.channels?.audit ? '✅' : '⚠️'}\nWelcome : ${config.welcomeChannel ? '✅' : '⚠️'}\nRôle modérateur : ${config.modRole ? '✅' : '⚠️'}` },
    { name: 'Services', value: `Base : ${database?.isDegraded ? '🟠 mémoire' : '✅ PostgreSQL'}\nLavalink : ${interaction.client.riffy ? '✅ disponible' : '🟠 indisponible'}\nModules actifs : ${modules.enabled.length}` },
  ] });
}

export default {
  data: new SlashCommandBuilder().setName('setup').setDescription('Assistant de configuration').setDMPermission(false)
    .addSubcommand((sub) => sub.setName('start').setDescription('Ouvre l’assistant'))
    .addSubcommand((sub) => sub.setName('verify').setDescription('Vérifie la configuration du serveur')),
  category: 'Core',
  async execute(interaction) {
    if (!isServerAdmin(interaction)) return InteractionHelper.safeReply(interaction, { content: 'Accès refusé.', ephemeral: true });
    if (interaction.options.getSubcommand() === 'verify') return InteractionHelper.safeReply(interaction, { embeds: [await buildServerVerification(interaction)], ephemeral: true });
    const configured = await ConfigService.exists(interaction.client, interaction.guildId);
    const embed = createEmbed({ title: 'Bienvenue dans Toxic Bot', description: configured ? 'Le serveur est déjà configuré.' : 'Le serveur n’est pas encore configuré.', color: 'primary', footer: 'Toxic Bot • Configuration', fields: [{ name: 'Options', value: '• Configurer\n• Vérifier le serveur' }] });
    await InteractionHelper.safeReply(interaction, { embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('setup-configure').setLabel('Configurer').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('setup-verify').setLabel('Vérifier le serveur').setStyle(ButtonStyle.Primary))], ephemeral: true });
  },
};
