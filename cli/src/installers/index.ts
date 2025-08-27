import { envVariablesInstaller } from "~/installers/envVars.js";
import { nextAuthInstaller } from "~/installers/nextAuth.js";
import { prismaInstaller } from "~/installers/prisma.js";
import { tailwindInstaller } from "~/installers/tailwind.js";
import { trpcInstaller } from "~/installers/trpc.js";
import { type PackageManager } from "~/utils/getUserPkgManager.js";
import { biomeInstaller } from "./biome.js";
import { dbContainerInstaller } from "./dbContainer.js";
import { drizzleInstaller } from "./drizzle.js";
import { dynamicEslintInstaller } from "./eslint.js";
import { firebaseInstaller } from "./firebase.js";
import { firebaseAuthInstaller } from "./firebaseAuth.js";
import { firestoreInstaller } from "./firestore.js";

// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
  "nextAuth",
  "firebaseAuth",
  "prisma",
  "drizzle",
  "firestore",
  "firebase",
  "tailwind",
  "trpc",
  "envVariables",
  "eslint",
  "biome",
  "dbContainer",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export const databaseProviders = [
  "mysql",
  "postgres",
  "sqlite",
  "planetscale",
  "firebase",
] as const;
export type DatabaseProvider = (typeof databaseProviders)[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  appRouter?: boolean;
  projectName: string;
  scopedAppName: string;
  databaseProvider: DatabaseProvider;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = Record<
  AvailablePackages,
  {
    inUse: boolean;
    installer: Installer;
  }
>;

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
  databaseProvider: DatabaseProvider
): PkgInstallerMap => ({
  nextAuth: {
    inUse: packages.includes("nextAuth") && databaseProvider !== "firebase",
    installer: nextAuthInstaller,
  },
  firebaseAuth: {
    inUse: packages.includes("firebaseAuth") || databaseProvider === "firebase",
    installer: firebaseAuthInstaller,
  },
  prisma: {
    inUse: packages.includes("prisma") && databaseProvider !== "firebase",
    installer: prismaInstaller,
  },
  drizzle: {
    inUse: packages.includes("drizzle") && databaseProvider !== "firebase",
    installer: drizzleInstaller,
  },
  firestore: {
    inUse: packages.includes("firestore") || databaseProvider === "firebase",
    installer: firestoreInstaller,
  },
  firebase: {
    inUse: packages.includes("firebase") || packages.includes("firebaseAuth") || packages.includes("firestore") || databaseProvider === "firebase",
    installer: firebaseInstaller,
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  trpc: {
    inUse: packages.includes("trpc"),
    installer: trpcInstaller,
  },
  dbContainer: {
    inUse: ["mysql", "postgres"].includes(databaseProvider),
    installer: dbContainerInstaller,
  },
  envVariables: {
    inUse: true,
    installer: envVariablesInstaller,
  },
  eslint: {
    inUse: packages.includes("eslint"),
    installer: dynamicEslintInstaller,
  },
  biome: {
    inUse: packages.includes("biome"),
    installer: biomeInstaller,
  },
});
