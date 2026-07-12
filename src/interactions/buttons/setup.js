import configWizard from '../../commands/Core/configWizard.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { buildServerVerification } from '../../commands/Core/setup.js';

const openWizard = async (interaction) => configWizard.execute(interaction);

export default [
  { name: 'setup-configure', execute: openWizard },
  {
    name: 'setup-verify',
    async execute(interaction) {
      await InteractionHelper.safeReply(interaction, { embeds: [await buildServerVerification(interaction)], ephemeral: true });
    },
  },
];
