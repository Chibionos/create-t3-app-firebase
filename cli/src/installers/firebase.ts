import path from "path";
import fs from "fs-extra";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";
import { type AvailablePackages } from "~/installers/index.js";
import { PKG_ROOT } from "~/consts.js";

export const firebaseInstaller: Installer = ({ projectDir, packages, appRouter }) => {
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
    appRouter
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
    appRouter
      ? "firebase-client-app.ts"
      : "firebase-client.ts"
  );
  const firebaseClientDest = path.join(
    projectDir,
    "src/lib/firebase.ts"
  );

  // Copy Firebase configuration files if they exist
  if (fs.existsSync(firebaseConfigSrc)) {
    fs.copySync(firebaseConfigSrc, firebaseConfigDest);
  }
  if (fs.existsSync(firebaseRcSrc)) {
    fs.copySync(firebaseRcSrc, firebaseRcDest);
  }
  
  // Ensure directories exist
  fs.ensureDirSync(path.dirname(firebaseAdminDest));
  fs.ensureDirSync(path.dirname(firebaseClientDest));
  
  // Copy Firebase SDK files if they exist
  if (fs.existsSync(firebaseAdminSrc)) {
    fs.copySync(firebaseAdminSrc, firebaseAdminDest);
  }
  if (fs.existsSync(firebaseClientSrc)) {
    fs.copySync(firebaseClientSrc, firebaseClientDest);
  }
};