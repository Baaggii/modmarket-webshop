# ModMarket Webshop

This repository contains the webshop application built with Node.js, Express and React.

## Setup

1. Copy `.env.example` to `.env` and fill in your database and OAuth settings.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the front‑end:
   ```bash
   ./deploy.sh
   ```
   This builds both the homepage and carpenter UIs into `public_html`.
4. Start the API server locally:
   ```bash
   node server.js
   ```

## Deployment

### cPanel

The `.cpanel.yml` file installs dependencies and restarts the Node application when a new version is pulled via cPanel's Git deployment feature.

### GitHub Actions

- `src/homepage/deploy.yml` deploys the webshop when code is pushed to the `main` branch. It SSHes into your server and runs `git pull` in `~/public_html`.
- `src/carpenters/deploy.yml` deploys the ERP part when pushed to the `master` branch. It pulls the code to `~/apps/erp-web`, installs dependencies, builds and reloads the app with `pm2`.

Push to the corresponding branch to trigger these workflows.
