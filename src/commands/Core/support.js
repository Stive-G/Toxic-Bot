import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Affiche les informations d’assistance du serveur'),

  async execute(interaction) {
    await InteractionHelper.safeReply(interaction, {
      embeds: [createEmbed({
        title: 'Besoin d’aide ?',
        description: 'Contactez un administrateur du serveur Toxic ou vérifiez les logs du bot.',
        color: 'info',
        footer: 'Toxic Bot • Serveur Toxic',
      })],
      flags: MessageFlags.Ephemeral,
    });
  },
};
