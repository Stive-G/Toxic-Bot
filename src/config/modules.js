import { botConfig } from './bot.js';

/** Maps command folders to the global feature that enables them. */
export const CATEGORY_FEATURE_MAP = Object.freeze({
  Birthday: 'birthday',
  Community: 'community',
  Core: 'core',
  Economy: 'economy',
  Fun: 'fun',
  Giveaway: 'giveaways',
  JoinToCreate: 'joinToCreate',
  Leveling: 'leveling',
  Logging: 'logging',
  Moderation: 'moderation',
  Music: 'music',
  Reaction_roles: 'reactionRoles',
  Search: 'search',
  ServerStats: 'counter',
  Ticket: 'tickets',
  Tools: 'tools',
  Utility: 'utility',
  Verification: 'verification',
  Welcome: 'welcome',
});

export function getFeatureForCategory(category) {
  return CATEGORY_FEATURE_MAP[category] || null;
}

export function isCategoryEnabled(category, features = botConfig.features) {
  const feature = getFeatureForCategory(category);
  if (!feature) return false;
  if (feature === 'core') return true;
  return features?.[feature] === true;
}

export function getModuleSummary(features = botConfig.features) {
  const entries = Object.entries(features || {});
  return {
    enabled: entries.filter(([, enabled]) => enabled).map(([name]) => name),
    disabled: entries.filter(([, enabled]) => !enabled).map(([name]) => name),
  };
}
