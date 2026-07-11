# Toxic Bot

Toxic Bot is a self-hosted Discord bot for community management. It combines moderation, tickets, verification, welcome flows, giveaways, leveling, economy, utility tools, server statistics, and music playback in one modular Node.js application.

The project uses discord.js v14, PostgreSQL for persistent data, and Lavalink v4 for music playback.

## Features

- Moderation: bans, kicks, timeouts, warnings, cases, notes, purge, and mass actions.
- Community: tickets, applications, verification, reaction roles, welcome/goodbye messages, auto-roles, birthdays, reports, and join-to-create voice channels.
- Engagement: leveling, economy, shop, giveaways, counting game, polls, and fun commands.
- Operations: audit logging, configurable server counters, dashboards, backups, migrations, and health endpoint.
- Music: Lavalink-powered queues, player controls, slash commands, and prefix shortcuts.

## Architecture

`src/commands` contains slash-command definitions grouped by feature. `src/events` subscribes to Discord events, `src/handlers` loads and routes commands/components, and `src/interactions` implements buttons, select menus, and modals. Business rules live in `src/services`; `src/utils` provides shared helpers, persistence adapters, embeds, logging, validation, and migration support. PostgreSQL is the primary store, with an in-memory fallback intended only for local development.

## Prerequisites

- Node.js 18 or later (Node.js 20 is used by Docker and CI)
- A PostgreSQL server, or Docker Compose
- A Discord application and bot token
- Lavalink v4 for music playback (included in Docker Compose)

## Discord Developer Portal

Create an application at the [Discord Developer Portal](https://discord.com/developers/applications), add a bot, and copy its token and application ID into `.env`. Enable these privileged gateway intents when the bot needs the corresponding features:

- Message Content
- Server Members
- Server Presences (only if you later add a feature requiring it)

Invite the bot with the `bot` and `applications.commands` OAuth2 scopes. Grant only the permissions needed by the modules you enable; typical installations need View Channels, Send Messages, Embed Links, Read Message History, Manage Messages, Manage Channels, Manage Roles, Kick Members, Ban Members, Moderate Members, and Connect.

## Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Stive-G/Toxic-Bot.git
   cd Toxic-Bot
   npm ci
   ```

2. Create your local configuration:

   ```bash
   cp .env.example .env
   ```

3. Set `DISCORD_TOKEN`, `CLIENT_ID`, and secure PostgreSQL and Lavalink credentials in `.env`. For one server, set `GUILD_ID`; set `MULTI_GUILD=true` to register global commands instead.

4. Prepare and verify the database:

   ```bash
   npm run migrate
   npm run migrate:check
   ```

5. Start the bot:

   ```bash
   npm start
   ```

## PostgreSQL

The default local database name and user are `toxicbot`. Configure either `POSTGRES_URL` (recommended for managed providers) or the `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` variables. Do not commit `.env` or reuse the example password.

For a local server:

```bash
createdb toxicbot
createuser toxicbot
psql -c "ALTER USER toxicbot PASSWORD 'use-a-unique-strong-password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE toxicbot TO toxicbot;"
```

## Lavalink

Music commands require Lavalink v4. Set `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`, and `LAVALINK_SECURE` to match your Lavalink server. The supplied `lavalink/application.yml` is mounted automatically by Docker Compose. For remote hosting, deploy Lavalink as a private service and point `LAVALINK_HOST` at its private hostname.

## Docker

Docker Compose keeps the existing three-service topology: `toxic-bot`, `toxic-bot-postgres`, and `toxic-bot-lavalink` on an internal `toxic-bot-network` bridge.

```bash
cp .env.example .env
# Set all required credentials in .env before continuing.
docker compose up -d --build
docker compose logs -f toxic-bot
```

Persistent PostgreSQL data is stored in the `toxic-bot-postgres-data` volume. Stop the stack with `docker compose down`; do not remove the volume unless you intentionally want to discard database data.

## Configuration and deployment

`.env.example` documents every supported environment variable. Use `NODE_ENV=production` in deployed environments and keep `LOG_LEVEL=warn` unless operational troubleshooting requires more detail. The bot exposes its health service on `PORT` (default `3000`). Keep PostgreSQL and Lavalink private to the Compose network or your provider VPC.

For a multi-server deployment, set `MULTI_GUILD=true`. Global Discord commands can take time to propagate after a first deployment.

## Updates and maintenance

Before updating, back up the database:

```bash
npm run backup:db
```

Then update code and dependencies, run migrations, and restart:

```bash
git pull --ff-only
npm ci
npm run migrate
docker compose up -d --build
```

Useful checks:

```bash
npm test
npm run migrate:check
npm run migrate:status
npm run backup:drill
```

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance and [SECURITY.md](SECURITY.md) for vulnerability reporting and self-hosting hardening.

## License

Toxic Bot is distributed under the [MIT License](LICENSE).
