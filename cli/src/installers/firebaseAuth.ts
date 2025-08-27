import path from "path";
import fs from "fs-extra";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { type AvailablePackages } from "~/installers/index.js";
import { PKG_ROOT } from "~/consts.js";

export const firebaseAuthInstaller: Installer = ({ projectDir, appRouter }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "firebase",
      "firebase-admin",
      "cookies-next",
      "jsonwebtoken",
    ],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [
      "@types/jsonwebtoken",
    ],
    devMode: true,
  });

  const extrasDir = path.join(PKG_ROOT, "template/extras");
  const isAppRouter = appRouter;

  // Copy auth context and hooks
  const authContextSrc = path.join(
    extrasDir,
    "src/context",
    isAppRouter ? "AuthContext-app.tsx" : "AuthContext.tsx"
  );
  const authContextDest = path.join(
    projectDir,
    "src/context/AuthContext.tsx"
  );

  const useAuthSrc = path.join(
    extrasDir,
    "src/hooks",
    "useAuth.ts"
  );
  const useAuthDest = path.join(
    projectDir,
    "src/hooks/useAuth.ts"
  );

  // Copy auth utilities
  const authUtilsSrc = path.join(
    extrasDir,
    "src/server/auth",
    isAppRouter ? "firebase-auth-app.ts" : "firebase-auth.ts"
  );
  const authUtilsDest = path.join(
    projectDir,
    "src/server/auth.ts"
  );

  // Copy auth middleware (for app router) if it exists
  if (isAppRouter) {
    const middlewareSrc = path.join(
      extrasDir,
      "src",
      "middleware.ts"
    );
    const middlewareDest = path.join(
      projectDir,
      "src/middleware.ts"
    );
    if (fs.existsSync(middlewareSrc)) {
      fs.copySync(middlewareSrc, middlewareDest);
    }
  }

  // Note: Firebase Auth doesn't require API routes like NextAuth
  // Authentication is handled directly through Firebase SDK

  // Ensure directories exist
  fs.ensureDirSync(path.dirname(authContextDest));
  fs.ensureDirSync(path.dirname(useAuthDest));
  fs.ensureDirSync(path.dirname(authUtilsDest));

  // Copy files if they exist
  if (fs.existsSync(authContextSrc)) {
    fs.copySync(authContextSrc, authContextDest);
  }
  if (fs.existsSync(useAuthSrc)) {
    fs.copySync(useAuthSrc, useAuthDest);
  }
  if (fs.existsSync(authUtilsSrc)) {
    fs.copySync(authUtilsSrc, authUtilsDest);
  }

  // Copy login/signup components if they exist
  const authComponentsSrc = path.join(
    extrasDir,
    "src/components/auth"
  );
  const authComponentsDest = path.join(
    projectDir,
    "src/components/auth"
  );
  if (fs.existsSync(authComponentsSrc)) {
    fs.ensureDirSync(authComponentsDest);
    fs.copySync(authComponentsSrc, authComponentsDest);
  }
};