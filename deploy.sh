#!/bin/bash
set -e

# Build homepage UI
npx vite build --config vite.home.config.js

# Build carpenters UI
npx vite build --config vite.carp.config.js

