import { ActionRowBuilder, Collection, MessageFlags } from 'discord.js';
import { createEmbed } from '../utils/embeds.js';
import { createButton, getPaginationRow } from '../utils/components.js';
import { formatCategoryName, getCategoryIcon } from '../config/commandCategories.js';
import { logger } from '../utils/logger.js';

const BACK_BUTTON_ID = 'help-back-to-main';
const ALL_COMMANDS_ID = 'help-all-commands';
const PAGINATION_PREFIX = 'help-page';
const CATEGORY_SELECT_ID = 'help-category-select';
const FOOTER_TEXT = 'Toxic Bot • Serveur Toxic';

function commandEntries(client, category = null) {
  return [...client.commands.values()]
    .filter((command) => !category || command.category === category)
    .filter((command) => command.data?.name !== 'help')
    .flatMap((command) => {
      const data = command.data.toJSON();
      const entries = [];
      for (const option of data.options || []) {
        if (option.type === 1) entries.push({ name: `${data.name} ${option.name}`, category: command.category });
        if (option.type === 2) {
          for (const subcommand of option.options || []) {
            if (subcommand.type === 1) entries.push({ name: `${data.name} ${option.name} ${subcommand.name}`, category: command.category });
          }
        }
      }
      return entries.length ? entries : [{ name: data.name, category: command.category }];
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function registeredCommands(client) {
  const commands = new Collection();
  if (!client.application?.commands?.fetch) return commands;
  try {
    for (const command of (await client.application.commands.fetch()).values()) commands.set(command.name, command);
  } catch (error) {
    logger.debug('Registered command mentions are unavailable.', { error: error.message });
  }
  return commands;
}

function commandLine(entry, registered) {
  const baseName = entry.name.split(' ')[0];
  const command = registered.get(baseName);
  return command?.id ? `</${entry.name}:${command.id}>` : `\`/${entry.name}\``;
}

async function createCategoryCommandsMenu(category, client) {
  const entries = commandEntries(client, category);
  const registered = await registeredCommands(client);
  const displayName = formatCategoryName(category);
  const embed = createEmbed({
    title: `${getCategoryIcon(category)} ${displayName}`,
    description: entries.length ? entries.map((entry) => commandLine(entry, registered)).join('\n').slice(0, 4000) : 'Aucune commande active dans cette catégorie.',
    color: 'primary',
    footer: FOOTER_TEXT,
  });

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(createButton(BACK_BUTTON_ID, 'Retour', 'primary', '⬅️', false))],
  };
}

export async function createAllCommandsMenu(page = 1, client) {
  const entries = commandEntries(client);
  const commandsPerPage = 45;
  const totalPages = Math.max(1, Math.ceil(entries.length / commandsPerPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const registered = await registeredCommands(client);
  const visibleEntries = entries.slice((currentPage - 1) * commandsPerPage, currentPage * commandsPerPage);
  const embed = createEmbed({
    title: 'Toutes les commandes actives',
    description: visibleEntries.length ? visibleEntries.map((entry) => `${commandLine(entry, registered)} · ${formatCategoryName(entry.category)}`).join('\n') : 'Aucune commande active.',
    color: 'primary',
    footer: FOOTER_TEXT,
  });
  const components = [];
  if (totalPages > 1) components.push(getPaginationRow(PAGINATION_PREFIX, currentPage, totalPages));
  components.push(new ActionRowBuilder().addComponents(createButton(BACK_BUTTON_ID, 'Retour', 'primary', '⬅️', false)));
  return { embeds: [embed], components, currentPage, totalPages };
}

export const helpCategorySelectMenu = {
  name: CATEGORY_SELECT_ID,
  async execute(interaction, client) {
    try {
      if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
      const selected = interaction.values[0];
      const view = selected === ALL_COMMANDS_ID
        ? await createAllCommandsMenu(1, client)
        : await createCategoryCommandsMenu(selected, client);
      await interaction.editReply(view);
    } catch (error) {
      logger.error('Error in help category select menu handler:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Impossible de charger cette catégorie.', flags: MessageFlags.Ephemeral });
      }
    }
  },
};
