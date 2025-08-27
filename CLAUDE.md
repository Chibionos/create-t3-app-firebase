# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **create-t3-app** monorepo - a CLI tool for scaffolding typesafe Next.js applications with the T3 Stack. The repository contains both the CLI package and documentation website.

## Repository Structure

- `/cli` - The main CLI package that users install via npm/yarn/pnpm
- `/www` - Documentation website built with Astro
- `/cli/template` - Template files used when scaffolding new T3 apps
- `/cli/src/installers` - Package installers for different stack options

## Development Commands

### Essential Commands
```bash
# Install dependencies (uses pnpm)
pnpm install

# Development
pnpm dev:cli    # Run CLI in watch mode
pnpm dev:www    # Run docs site with HMR

# Build
pnpm build:cli  # Build the CLI
pnpm build:www  # Build the docs
pnpm build      # Build everything

# Quality checks
pnpm check      # Run all checks (lint, typecheck, format)
pnpm lint       # Lint code
pnpm lint:fix   # Fix linting issues
pnpm format     # Format code with Prettier
pnpm typecheck  # Type checking with TypeScript
```

### Publishing
```bash
pnpm changeset      # Create a changeset for versioning
pnpm pub:beta       # Publish beta version
pnpm pub:release    # Publish stable release
```

## Architecture

### CLI Package (`/cli`)
The CLI is built with TypeScript and uses:
- **Commander** for CLI argument parsing
- **@clack/prompts** for interactive prompts
- **Installers pattern**: Each optional package (tRPC, Tailwind, Prisma, etc.) has its own installer in `/cli/src/installers`
- **Template system**: Base templates in `/cli/template/base`, extras in `/cli/template/extras`

### Key Concepts
1. **Modular Stack**: Users select which packages to include (Next.js is always included)
2. **Database Providers**: Supports Prisma/Drizzle with PostgreSQL, MySQL, SQLite, PlanetScale
3. **App Router vs Pages Router**: Templates support both Next.js routing patterns
4. **Package Managers**: Automatically detects and uses npm/yarn/pnpm/bun

### Adding Features to CLI
When adding new optional packages:
1. Create installer in `/cli/src/installers/[package].ts`
2. Add template files to `/cli/template/extras/`
3. Update the CLI prompts in `/cli/src/cli/index.ts`
4. Ensure installer handles both app router and pages router

## Testing Changes

To test CLI changes locally:
```bash
pnpm build:cli
pnpm start:cli  # Run the built CLI
```

## Contribution Workflow

1. Changes require a changeset: `pnpm changeset`
2. Follow conventional commits (feat:, fix:, chore:, docs:)
3. Run `pnpm check` before submitting PR
4. The project uses Turborepo for monorepo management

## Important Notes

- Node.js >=20.0.0 required for development
- The CLI supports Node.js >=18.17.0 for end users
- The project follows T3 Axioms: Solve Problems, Bleed Responsibly, Typesafety Isn't Optional
- When modifying templates, ensure compatibility with both app router and pages router