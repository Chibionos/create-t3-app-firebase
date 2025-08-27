import path from "path";
import fs from "fs-extra";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { type AvailablePackages } from "~/installers/index.js";
import { PKG_ROOT } from "~/consts.js";

export const firebaseAuthInstaller: Installer = ({ projectDir, packages }) => {
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
  const isAppRouter = packages?.includes("appRouter" as AvailablePackages);

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

  // Copy auth middleware (for app router)
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
    fs.copySync(middlewareSrc, middlewareDest);
  }

  // Copy auth API routes
  if (!isAppRouter) {
    const authApiSrc = path.join(
      extrasDir,
      "src/pages/api/auth",
      "[...auth].ts"
    );
    const authApiDest = path.join(
      projectDir,
      "src/pages/api/auth/[...auth].ts"
    );
    fs.ensureDirSync(path.dirname(authApiDest));
    fs.copySync(authApiSrc, authApiDest);
  } else {
    // App Router auth route
    const authRouteSrc = path.join(
      extrasDir,
      "src/app/api/auth",
      "[...auth]",
      "route.ts"
    );
    const authRouteDest = path.join(
      projectDir,
      "src/app/api/auth/[...auth]/route.ts"
    );
    fs.ensureDirSync(path.dirname(authRouteDest));
    fs.copySync(authRouteSrc, authRouteDest);
  }

  // Ensure directories exist
  fs.ensureDirSync(path.dirname(authContextDest));
  fs.ensureDirSync(path.dirname(useAuthDest));
  fs.ensureDirSync(path.dirname(authUtilsDest));

  // Copy files
  fs.copySync(authContextSrc, authContextDest);
  fs.copySync(useAuthSrc, useAuthDest);
  fs.copySync(authUtilsSrc, authUtilsDest);

  // Copy login/signup components
  const authComponentsSrc = path.join(
    extrasDir,
    "src/components/auth"
  );
  const authComponentsDest = path.join(
    projectDir,
    "src/components/auth"
  );
  fs.ensureDirSync(authComponentsDest);
  fs.copySync(authComponentsSrc, authComponentsDest);
};