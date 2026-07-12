import { SlashCommandBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from '../../utils/embeds.js';
import { createSelectMenu } from '../../utils/components.js';
import { formatCategoryName, getCategoryIcon } from '../../config/commandCategories.js';

const CATEGORY_SELECT_ID = 'help-category-select';
const ALL_COMMANDS_ID = 'help-all-commands';
const HELP_MENU_TIMEOUT_MS = 5 * 60 * 1000;

export function getActiveHelpCategories(client) {
  return [...new Set([...client.commands.values()].map((command) => command.category))]
    .sort((left, right) => formatCategoryName(left).localeCompare(formatCategoryName(right)));
}

export async function createInitialHelpMenu(client) {
  const categories = getActiveHelpCategories(client);
  const options = [
    {
      label: 'Toutes les commandes',
      description: 'Afficher uniquement les commandes actives.',
      value: ALL_COMMANDS_ID,
    },
    ...categories.map((category) => ({
      label: `${getCategoryIcon(category)} ${formatCategoryName(category)}`.slice(0, 100),
      description: `Commandes actives : ${formatCategoryName(category)}`.slice(0, 100),
      value: category,
    })),
  ];

  const embed = createEmbed({
    title: 'Toxic Bot',
    description: 'Assistant du serveur Toxic.',
    color: 'primary',
    thumbnail: client.user?.displayAvatarURL?.({ size: 1024 }),
    footer: 'Toxic Bot • Serveur Toxic',
    fields: [
      {
        name: 'Démarrage',
        value: [
          '• `/configwizard` — configure le préfixe, le rôle de modération et les logs',
          '• `/commands dashboard` — active ou désactive les modules disponibles',
          '• `/help` — affiche uniquement les commandes disponibles',
        ].join('\n'),
      },
      {
        name: 'Fonctionnement',
        value: [
          '• Les réglages sont enregistrés pour le serveur',
          '• Les commandes slash et préfixées suivent les modules actifs',
          '• Seules les fonctions activées sont affichées',
        ].join('\n'),
      },
    ],
  });

  return {
    embeds: [embed],
    components: [createSelectMenu(CATEGORY_SELECT_ID, 'Choisir une catégorie', options)],
  };
}

export default {
  slashOnly: true,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche les commandes disponibles'),

  async execute(interaction, guildConfig, client) {
    await InteractionHelper.safeDefer(interaction);
    const { embeds, components } = await createInitialHelpMenu(client);
    await InteractionHelper.safeEditReply(interaction, { embeds, components });

    setTimeout(async () => {
      if (!InteractionHelper.isInteractionValid(interaction)) return;
      await InteractionHelper.safeEditReply(interaction, {
        embeds: [createEmbed({
          title: 'Menu d’aide fermé',
          description: 'Utilisez `/help` pour l’ouvrir à nouveau.',
          color: 'secondary',
          footer: 'Toxic Bot • Serveur Toxic',
        })],
        components: [],
      });
    }, HELP_MENU_TIMEOUT_MS);
  },
};
