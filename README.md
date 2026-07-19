A custom Shopify restaurant theme originally developed for a customer. The
repository is retained as an example of using component-oriented JavaScript and
custom elements within a traditional Shopify Liquid theme.

## Architecture

- Shopify Liquid templates, sections, snippets, and merchant-editable schemas
- Custom elements powered by Haunted and Lit
- Asynchronous cart, collection, product, and predictive-search integrations
- SCSS styling based on Bootstrap 4
- Vite builds the JavaScript and SCSS directly into Shopify theme assets
- Biome performs JavaScript linting and Prettier checks source formatting

The theme uses `bootstrap.native` 3.x because its markup and Sass are based on
Bootstrap 4. Upgrading that dependency to 5.x would require a Bootstrap markup
migration.

## Requirements

- Node.js 20.19 or later, or Node.js 22.12 or later
- npm 11
- A Shopify store or development store for runtime testing

## Setup

```sh
npm install
npm run build
```

## Commands

```sh
npm run dev          # Rebuild the readable assets when source files change
npm run build        # Build readable and minified production assets
npm run lint         # Lint JavaScript with Biome
npm run lint:fix     # Apply safe Biome lint fixes
npm run format       # Format source and configuration files with Prettier
npm run format:check # Check formatting without changing files
npm run check        # Run linting, formatting checks, and a production build
```

## Build output

Vite preserves the asset names expected by the Shopify theme:

```text
theme/assets/theme.scss.liquid
theme/assets/theme.js
theme/assets/theme.min.js
```

Generated assets are excluded from version control and should be rebuilt after
checking out the project.

## Runtime testing

The local build verifies compilation and static checks, but Shopify-specific
behavior—including cart endpoints, Liquid data, product variants, and theme
editor settings—must be tested in a Shopify store.
