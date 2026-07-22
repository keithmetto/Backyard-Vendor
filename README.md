# Backyard Vendor

Backyard Vendor is a capstone project for the internship program. The goal is to build a Node.js application that helps small local vendors present products, manage basic listings, and prepare for customer orders.

## Tech Stack

- Node.js LTS
- JavaScript
- npm
- Cursor for AI-assisted development

## Project Status

Vendor settings are available as a static page with client-side validation and `localStorage` persistence. Catalog and order features are still ahead.

## Capstone Scope

The first milestone will focus on a simple vendor catalog. A vendor should be able to define product names, descriptions, prices, and availability so customers can understand what is currently offered.

## Getting Started

1. Install Node.js LTS and Git.
2. Clone this repository.
3. No `npm install` is required for the current feature (zero runtime dependencies).
4. Use Conventional Commits for all changes.

### Open vendor settings

```bash
npm start
```

Then open [http://localhost:3000/settings.html](http://localhost:3000/settings.html) in your browser.

Settings are stored in the browser under the key `backyard-vendor-settings`.

### Run tests

```bash
npm test
```

Validation helpers are covered with Node’s built-in test runner (`node --test`).

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Examples:

- `docs: add project README`
- `chore: configure gitignore`
- `feat: add product listing model`
- `feat: add vendor settings form with validation`
