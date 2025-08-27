import * as p from "@clack/prompts";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";

// Firebase configuration schema
const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
});

const firebaseAdminSchema = z.object({
  projectId: z.string().min(1),
  clientEmail: z.string().email(),
  privateKey: z.string().min(1),
});

export type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;
export type FirebaseAdminConfig = z.infer<typeof firebaseAdminSchema>;

export const collectFirebaseConfig = async (): Promise<{
  clientConfig: FirebaseConfig | null;
  adminConfig: FirebaseAdminConfig | null;
}> => {
  const shouldConfigureNow = await p.confirm({
    message: "Would you like to configure Firebase now? (You can do this later)",
    initialValue: true,
  });

  if (!shouldConfigureNow) {
    return { clientConfig: null, adminConfig: null };
  }

  // Collect client configuration
  const configMethod = await p.select({
    message: "How would you like to provide Firebase configuration?",
    options: [
      { value: "paste", label: "Paste configuration object" },
      { value: "manual", label: "Enter values manually" },
      { value: "skip", label: "Skip for now" },
    ],
  });

  let clientConfig: FirebaseConfig | null = null;

  if (configMethod === "paste") {
    const configString = await p.text({
      message: "Paste your Firebase configuration object (from Firebase Console > Project Settings):",
      placeholder: '{ apiKey: "...", authDomain: "...", ... }',
    });

    try {
      // Parse and validate the pasted config
      // Try to parse as JSON first, if that fails, try to extract object properties
      let parsed;
      try {
        parsed = JSON.parse(configString as string);
      } catch {
        // If JSON parse fails, try to extract as JavaScript object
        // Remove const/let/var and variable assignment if present
        const cleanedString = (configString as string)
          .replace(/^(const|let|var)\s+\w+\s*=\s*/, '')
          .replace(/;?\s*$/, '');
        
        // Convert JavaScript object notation to JSON
        const jsonString = cleanedString
          .replace(/(['"])?(\w+)(['"])?\s*:/g, '"$2":') // Quote keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes
          
        parsed = JSON.parse(jsonString);
      }
      
      clientConfig = firebaseConfigSchema.parse(parsed);
      p.log.success("Firebase configuration validated successfully!");
    } catch (error) {
      p.log.error("Invalid configuration format. Please check and try again later.");
    }
  } else if (configMethod === "manual") {
    const config = await p.group({
      apiKey: () => p.text({
        message: "Firebase API Key:",
        placeholder: "AIzaSy...",
      }),
      authDomain: () => p.text({
        message: "Auth Domain:",
        placeholder: "your-app.firebaseapp.com",
      }),
      projectId: () => p.text({
        message: "Project ID:",
        placeholder: "your-project-id",
      }),
      storageBucket: () => p.text({
        message: "Storage Bucket:",
        placeholder: "your-app.appspot.com",
      }),
      messagingSenderId: () => p.text({
        message: "Messaging Sender ID:",
        placeholder: "123456789",
      }),
      appId: () => p.text({
        message: "App ID:",
        placeholder: "1:123456789:web:abc...",
      }),
    });

    try {
      clientConfig = firebaseConfigSchema.parse(config);
      p.log.success("Firebase configuration validated successfully!");
    } catch (error) {
      p.log.error("Invalid configuration. Please check and try again later.");
    }
  }

  // Collect admin configuration
  let adminConfig: FirebaseAdminConfig | null = null;
  
  if (clientConfig) {
    const shouldConfigureAdmin = await p.confirm({
      message: "Would you like to configure Firebase Admin SDK now? (Required for server-side operations)",
      initialValue: true,
    });

    if (shouldConfigureAdmin) {
      const adminMethod = await p.select({
        message: "How would you like to provide Firebase Admin credentials?",
        options: [
          { value: "paste", label: "Paste service account JSON" },
          { value: "manual", label: "Enter values manually" },
          { value: "skip", label: "Skip for now" },
        ],
      });

      if (adminMethod === "paste") {
        const adminString = await p.text({
          message: "Paste your service account JSON (from Firebase Console > Project Settings > Service Accounts):",
          placeholder: '{ "project_id": "...", "client_email": "...", "private_key": "..." }',
        });

        try {
          const parsed = JSON.parse(adminString as string);
          adminConfig = firebaseAdminSchema.parse({
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key,
          });
          p.log.success("Firebase Admin configuration validated successfully!");
        } catch (error) {
          p.log.error("Invalid admin configuration. You can add it later to the .env file.");
        }
      } else if (adminMethod === "manual") {
        const config = await p.group({
          projectId: () => p.text({
            message: "Project ID:",
            placeholder: "your-project-id",
            defaultValue: clientConfig.projectId,
          }),
          clientEmail: () => p.text({
            message: "Service Account Email:",
            placeholder: "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
          }),
          privateKey: () => p.text({
            message: "Private Key (paste the entire key including BEGIN/END lines):",
            placeholder: "-----BEGIN PRIVATE KEY-----\\n...",
          }),
        });

        try {
          adminConfig = firebaseAdminSchema.parse(config);
          p.log.success("Firebase Admin configuration validated successfully!");
        } catch (error) {
          p.log.error("Invalid admin configuration. You can add it later to the .env file.");
        }
      }
    }
  }

  return { clientConfig, adminConfig };
};

export const writeFirebaseConfig = (
  projectDir: string,
  clientConfig: FirebaseConfig | null,
  adminConfig: FirebaseAdminConfig | null
) => {
  if (clientConfig) {
    // Write client configuration to firebase.ts
    const firebaseConfigContent = `import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "${clientConfig.apiKey}",
  authDomain: "${clientConfig.authDomain}",
  projectId: "${clientConfig.projectId}",
  storageBucket: "${clientConfig.storageBucket}",
  messagingSenderId: "${clientConfig.messagingSenderId}",
  appId: "${clientConfig.appId}",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
`;

    const firebaseConfigPath = path.join(projectDir, "src/lib/firebase.ts");
    fs.ensureDirSync(path.dirname(firebaseConfigPath));
    fs.writeFileSync(firebaseConfigPath, firebaseConfigContent);

    // Update .firebaserc with project ID
    const firebaseRcPath = path.join(projectDir, ".firebaserc");
    const firebaseRc = {
      projects: {
        default: clientConfig.projectId,
      },
    };
    fs.writeJsonSync(firebaseRcPath, firebaseRc, { spaces: 2 });
  }

  if (adminConfig) {
    // Update .env file with admin configuration
    const envPath = path.join(projectDir, ".env");
    const envExamplePath = path.join(projectDir, ".env.example");
    
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
    let envExampleContent = fs.existsSync(envExamplePath) ? fs.readFileSync(envExamplePath, "utf-8") : "";

    // Add or update admin config in .env
    const adminEnvVars = `
# Firebase Admin SDK
FIREBASE_PROJECT_ID="${adminConfig.projectId}"
FIREBASE_CLIENT_EMAIL="${adminConfig.clientEmail}"
FIREBASE_PRIVATE_KEY="${adminConfig.privateKey}"
`;

    // Remove old Firebase admin vars if they exist
    envContent = envContent.replace(/\n?# Firebase Admin SDK[\s\S]*?(?=\n#|\n\n|$)/g, "");
    envContent += adminEnvVars;

    fs.writeFileSync(envPath, envContent.trim() + "\n");

    // Update .env.example with placeholders
    const adminEnvExample = `
# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...your-private-key...\\n-----END PRIVATE KEY-----\\n"
`;

    envExampleContent = envExampleContent.replace(/\n?# Firebase Admin SDK[\s\S]*?(?=\n#|\n\n|$)/g, "");
    envExampleContent += adminEnvExample;

    fs.writeFileSync(envExamplePath, envExampleContent.trim() + "\n");
  }
};