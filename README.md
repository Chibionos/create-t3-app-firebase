# create-t3-fire 🔥

A Firebase-enhanced version of create-t3-app - the best way to start a full-stack, typesafe Next.js app with Firebase integration.

## Quick Start

```bash
npm create t3-fire@latest
# or
yarn create t3-fire
# or
pnpm create t3-fire@latest
# or
bun create t3-fire@latest
```

## What's Different from create-t3-app?

This is a fork of the popular [create-t3-app](https://github.com/t3-oss/create-t3-app) that replaces traditional backend services with Firebase:

- **Firebase Firestore** instead of Prisma/Drizzle
- **Firebase Authentication** instead of NextAuth.js  
- **Firebase Hosting** configuration included
- All the same T3 Stack benefits: TypeScript, tRPC, Tailwind CSS

## The Stack

- [Next.js](https://nextjs.org)
- [Firebase](https://firebase.google.com)
  - Firestore (NoSQL Database)
  - Authentication
  - Hosting
- [TypeScript](https://typescriptlang.org)
- [tRPC](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)

## Features

✅ **Type Safety** - Full-stack type safety with TypeScript  
✅ **Firebase Auth** - Email/password and social providers  
✅ **Firestore Database** - Real-time NoSQL database  
✅ **tRPC Integration** - Type-safe API routes  
✅ **Tailwind CSS** - Utility-first CSS framework  
✅ **Firebase Hosting Ready** - Deploy configuration included  

## Getting Started

1. Run the CLI and follow the prompts:
```bash
npm create t3-fire@latest my-app
```

2. Configure Firebase:
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Copy your configuration to `.env`
   - Enable Authentication and Firestore

3. Start developing:
```bash
cd my-app
npm install
npm run dev
```

4. Deploy to Firebase:
```bash
npm run firebase:deploy
```

## Development

To work on this CLI locally:

```bash
# Clone the repo
git clone https://github.com/Chibionos/create-t3-app-firebase.git
cd create-t3-app-firebase

# Install dependencies
pnpm install

# Build the CLI
pnpm build:cli

# Test locally
cd cli && node dist/index.js test-app
```

## Credits

Built on top of the amazing [create-t3-app](https://github.com/t3-oss/create-t3-app) by [Theo](https://twitter.com/t3dotgg) and the T3 Stack community.

## License

MIT