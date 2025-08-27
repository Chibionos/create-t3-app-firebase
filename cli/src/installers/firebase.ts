import path from "path";
import fs from "fs-extra";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";
import { type AvailablePackages } from "~/installers/index.js";
import { PKG_ROOT } from "~/consts.js";

export const firebaseInstaller: Installer = ({ projectDir, packages }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "firebase",
      "firebase-admin",
    ],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [
      "firebase-tools",
    ],
    devMode: true,
  });

  // Add Firebase scripts
  addPackageScript({
    projectDir,
    scripts: {
      "firebase:deploy": "firebase deploy",
      "firebase:serve": "firebase serve",
      "firebase:emulators": "firebase emulators:start",
      "firebase:init": "firebase init",
    },
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const firebaseConfigSrc = path.join(
    extrasDir,
    "config",
    "firebase.json"
  );
  const firebaseConfigDest = path.join(projectDir, "firebase.json");

  const firebaseRcSrc = path.join(
    extrasDir,
    "config",
    "firebaserc"
  );
  const firebaseRcDest = path.join(projectDir, ".firebaserc");

  const firebaseAdminSrc = path.join(
    extrasDir,
    "src/server/firebase",
    packages?.includes("appRouter" as AvailablePackages) 
      ? "firebase-admin-app.ts"
      : "firebase-admin.ts"
  );
  const firebaseAdminDest = path.join(
    projectDir,
    "src/server/firebase-admin.ts"
  );

  const firebaseClientSrc = path.join(
    extrasDir,
    "src/lib/firebase",
    packages?.includes("appRouter" as AvailablePackages)
      ? "firebase-client-app.ts"
      : "firebase-client.ts"
  );
  const firebaseClientDest = path.join(
    projectDir,
    "src/lib/firebase.ts"
  );

  // Copy Firebase configuration files
  fs.copySync(firebaseConfigSrc, firebaseConfigDest);
  fs.copySync(firebaseRcSrc, firebaseRcDest);
  
  // Ensure directories exist
  fs.ensureDirSync(path.dirname(firebaseAdminDest));
  fs.ensureDirSync(path.dirname(firebaseClientDest));
  
  // Copy Firebase SDK files
  fs.copySync(firebaseAdminSrc, firebaseAdminDest);
  fs.copySync(firebaseClientSrc, firebaseClientDest);
};