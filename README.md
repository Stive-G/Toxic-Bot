# Toxic Bot

Toxic Bot est un bot Discord personnel pour un seul serveur. Il regroupe la modération, les tickets, la vérification, les rôles, l'économie, les giveaways, les statistiques et la musique.

## Prérequis

- Docker Desktop ou Docker Engine avec Docker Compose
- Une application Discord avec un bot
- Les identifiants Discord, PostgreSQL et Lavalink renseignés dans `.env`

## Configuration Discord

Dans le [Discord Developer Portal](https://discord.com/developers/applications), créez ou ouvrez l'application du bot, puis récupérez :

- le token du bot (`DISCORD_TOKEN`) ;
- l'identifiant de l'application (`CLIENT_ID`) ;
- l'identifiant du serveur personnel (`GUILD_ID`).

Activez les intents **Message Content** et **Server Members**. Invitez le bot avec les scopes `bot` et `applications.commands`.

## Fichier `.env`

Copiez l'exemple puis remplacez tous les placeholders :

```bash
cp .env.example .env
```

Pour cet usage mono-serveur, conservez `MULTI_GUILD=false` et renseignez `GUILD_ID`. Définissez des mots de passe distincts et robustes pour `POSTGRES_PASSWORD` et `LAVALINK_PASSWORD`.

## Lancement avec Docker Compose

```bash
docker compose up -d --build
```

La stack démarre Toxic Bot, PostgreSQL et Lavalink. Arrêtez-la avec :

```bash
docker compose down
```

## Logs

```bash
docker compose logs -f toxic-bot
docker compose logs -f db
docker compose logs -f lavalink
```

## Modules

Toxic Bot charge uniquement les modules activés dans `src/config/bot.js`. Après une modification globale, redémarrez le bot et réenregistrez les commandes. `/commands dashboard` permet ensuite de gérer les catégories disponibles pour ce serveur ; un module désactivé globalement ne peut pas être activé depuis Discord et reste simplement présent dans le code.

Activés par défaut : Core, Moderation, Welcome, Verification, Reaction Roles, Join To Create, Music, Utility, Tools, Giveaways, Server Stats, Fun et Logging.

Désactivés par défaut : Tickets, Economy, Leveling, Birthday, Community/Applications et Search.

Diagnostic local :

```bash
npm run commands:check
```

## Configuration du serveur

- `/setup` ouvre l’assistant d’administration ; `/setup verify` vérifie permissions, services et modules.
- `/config show` affiche les réglages, `/config edit` ouvre les menus existants et `/config reset` demande une confirmation explicite.
- `/diagnostic` affiche l’état de Discord, PostgreSQL, Lavalink, des modules et du runtime.

## Migrations PostgreSQL

Après un démarrage de la base, appliquez et vérifiez les migrations :

```bash
npm run migrate
npm run migrate:check
npm run migrate:status
```

## Sauvegarde et restauration

```bash
npm run backup:db
npm run restore:db
```

Les sauvegardes sont placées dans `BACKUP_DIR` (par défaut `./backups`). Testez périodiquement une restauration avec `npm run backup:drill`.

## Secrets

Ne versionnez jamais `.env`, les tokens Discord, les mots de passe PostgreSQL/Lavalink ou les clés d'API. Remplacez immédiatement tout secret exposé. `.env` est déjà ignoré par Git.

## Licence

Le projet conserve la [licence MIT](LICENSE) et son copyright d'origine.
