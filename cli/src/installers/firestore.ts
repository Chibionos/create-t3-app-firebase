import path from "path";
import fs from "fs-extra";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { type AvailablePackages } from "~/installers/index.js";
import { PKG_ROOT } from "~/consts.js";

export const firestoreInstaller: Installer = ({ projectDir, appRouter }) => {
  // Firebase packages are added by the main firebase installer
  // This installer focuses on Firestore-specific setup

  const extrasDir = path.join(PKG_ROOT, "template/extras");
  const isAppRouter = appRouter;

  // Copy Firestore database configuration
  const dbConfigSrc = path.join(
    extrasDir,
    "src/server/db",
    isAppRouter ? "firestore-app.ts" : "firestore.ts"
  );
  const dbConfigDest = path.join(
    projectDir,
    "src/server/db.ts"
  );

  // Copy Firestore type definitions
  const typesSrc = path.join(
    extrasDir,
    "src/types",
    "firestore.ts"
  );
  const typesDest = path.join(
    projectDir,
    "src/types/firestore.ts"
  );

  // Copy Firestore utilities
  const utilsSrc = path.join(
    extrasDir,
    "src/lib/firestore",
    "utils.ts"
  );
  const utilsDest = path.join(
    projectDir,
    "src/lib/firestore-utils.ts"
  );

  // Copy collection helpers
  const collectionsSrc = path.join(
    extrasDir,
    "src/server/db",
    "collections.ts"
  );
  const collectionsDest = path.join(
    projectDir,
    "src/server/collections.ts"
  );

  // Ensure directories exist
  fs.ensureDirSync(path.dirname(dbConfigDest));
  fs.ensureDirSync(path.dirname(typesDest));
  fs.ensureDirSync(path.dirname(utilsDest));
  fs.ensureDirSync(path.dirname(collectionsDest));

  // Copy files if they exist
  if (fs.existsSync(dbConfigSrc)) {
    fs.copySync(dbConfigSrc, dbConfigDest);
  }
  if (fs.existsSync(typesSrc)) {
    fs.copySync(typesSrc, typesDest);
  }
  if (fs.existsSync(utilsSrc)) {
    fs.copySync(utilsSrc, utilsDest);
  }
  if (fs.existsSync(collectionsSrc)) {
    fs.copySync(collectionsSrc, collectionsDest);
  }

  // Add Firestore rules file if it exists
  const rulesTemplateSrc = path.join(
    extrasDir,
    "config",
    "firestore.rules"
  );
  const rulesTemplateDest = path.join(projectDir, "firestore.rules");
  if (fs.existsSync(rulesTemplateSrc)) {
    fs.copySync(rulesTemplateSrc, rulesTemplateDest);
  }

  // Add Firestore indexes file if it exists
  const indexesSrc = path.join(
    extrasDir,
    "config",
    "firestore.indexes.json"
  );
  const indexesDest = path.join(projectDir, "firestore.indexes.json");
  if (fs.existsSync(indexesSrc)) {
    fs.copySync(indexesSrc, indexesDest);
  }
};