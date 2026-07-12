import configWizard from '../../commands/Core/configWizard.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const openWizard = async (interaction) => configWizard.execute(interaction);

export default [
  { name: 'setup-quick', execute: openWizard },
  { name: 'setup-advanced', execute: openWizard },
  {
    name: 'setup-verify',
    async execute(interaction) {
      await InteractionHelper.safeReply(interaction, {
        embeds: [createEmbed({ title: 'Vérification du serveur', description: 'Utilisez `/setup verify` pour lancer la vérification complète.', color: 'info', footer: 'Toxic Bot • Configuration' })],
        ephemeral: true,
      });
    },
  },
];
