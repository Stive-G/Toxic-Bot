import { PermissionFlagsBits } from 'discord.js';
import { botConfig } from '../config/bot.js';

export function isServerAdmin(interaction) {
  // Administrator manages this server; OWNER_IDS manages the bot across servers.
  if (botConfig.commands.owners.includes(interaction.user?.id)) return true;
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) === true;
}
