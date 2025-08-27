# Firebase Integration Migration Plan

## Overview
This document outlines the complete migration plan to transform create-t3-app to use Firebase services instead of the current stack:
- **Database**: Prisma → Firebase Firestore
- **Authentication**: NextAuth.js → Firebase Auth
- **Hosting**: Vercel/Netlify → Firebase Hosting

## Migration Checklist

### 1. Firebase Installers (/cli/src/installers/)
- [ ] Create `firebase.ts` - Main Firebase installer
  - [ ] Install Firebase SDK packages
  - [ ] Setup Firebase configuration files
  - [ ] Initialize Firebase Admin SDK for server-side
  - [ ] Create Firebase client initialization
- [ ] Create `firebaseAuth.ts` - Firebase Auth installer
  - [ ] Replace NextAuth.js implementation
  - [ ] Setup authentication providers
  - [ ] Create auth context/hooks
  - [ ] Server-side session management
- [ ] Create `firestore.ts` - Firestore database installer
  - [ ] Replace Prisma ORM functionality
  - [ ] Create Firestore collections structure
  - [ ] Type-safe document interfaces
  - [ ] CRUD operations helpers

### 2. Template Files (/cli/template/extras/)
- [ ] Firebase configuration templates
  - [ ] `firebase.json` - Firebase project config
  - [ ] `.firebaserc` - Firebase project settings
  - [ ] `firebase-admin.ts` - Admin SDK initialization
  - [ ] `firebase-client.ts` - Client SDK initialization
- [ ] Environment variables template
  - [ ] Update `.env.example` with Firebase variables
  - [ ] Remove Prisma/NextAuth variables
  - [ ] Add Firebase project configuration
- [ ] Authentication templates
  - [ ] `AuthContext.tsx` - React context for auth
  - [ ] `useAuth.tsx` - Custom auth hook
  - [ ] `withAuth.tsx` - HOC for protected routes
  - [ ] Login/Signup components
- [ ] Firestore templates
  - [ ] `db.ts` - Database initialization
  - [ ] Collection type definitions
  - [ ] CRUD operation utilities

### 3. Update Base Templates (/cli/template/base/)
- [ ] Modify `package.json`
  - [ ] Add Firebase dependencies
  - [ ] Remove Prisma/NextAuth dependencies
  - [ ] Add deployment scripts for Firebase
- [ ] Update Next.js configuration
  - [ ] `next.config.js` for Firebase hosting
  - [ ] Add Firebase-specific build optimizations

### 4. CLI Updates (/cli/src/cli/)
- [ ] Update `index.ts`
  - [ ] Add Firebase option to database choices
  - [ ] Replace NextAuth with Firebase Auth option
  - [ ] Add Firebase project setup prompts
- [ ] Modify package selection logic
  - [ ] Handle Firebase + tRPC integration
  - [ ] Ensure compatibility checks

### 5. Helper Functions (/cli/src/helpers/)
- [ ] Create `setupFirebase.ts`
  - [ ] Firebase CLI detection
  - [ ] Project initialization
  - [ ] Automatic configuration
- [ ] Update `createProject.ts`
  - [ ] Handle Firebase-specific setup
  - [ ] Initialize Firebase project structure

### 6. Update Dependency Versions (/cli/src/installers/)
- [ ] Add to `dependencyVersionMap.ts`:
  - [ ] firebase
  - [ ] firebase-admin
  - [ ] firebase-functions
  - [ ] @firebase/app-types
  - [ ] react-firebase-hooks (optional)

### 7. tRPC Integration Updates
- [ ] Update tRPC context for Firebase Auth
  - [ ] Pass Firebase user to context
  - [ ] Server-side auth validation
- [ ] Create Firebase-specific tRPC procedures
  - [ ] Protected procedures with Firebase Auth
  - [ ] Firestore integration in procedures

### 8. Example Routes/Components
- [ ] Update example post router
  - [ ] Use Firestore instead of Prisma
  - [ ] Firebase Auth for protected routes
- [ ] Update example components
  - [ ] Sign in/out with Firebase Auth
  - [ ] Display Firebase user info

### 9. Documentation Updates
- [ ] Update `/www` documentation
  - [ ] Firebase setup guide
  - [ ] Environment variables guide
  - [ ] Deployment to Firebase Hosting
  - [ ] Firebase Auth providers setup
- [ ] Update inline comments and JSDoc

### 10. Build & Deployment Configuration
- [ ] Firebase Hosting configuration
  - [ ] `firebase.json` with Next.js settings
  - [ ] Cloud Functions for SSR
  - [ ] Static asset optimization
- [ ] GitHub Actions for Firebase deployment
- [ ] Remove Vercel/Netlify specific files

### 11. Testing
- [ ] Test new project creation with Firebase
- [ ] Test authentication flow
- [ ] Test Firestore CRUD operations
- [ ] Test tRPC with Firebase Auth
- [ ] Test deployment to Firebase Hosting
- [ ] Test with all package manager options

### 12. Package.json Scripts
- [ ] Add Firebase-specific scripts:
  - [ ] `firebase:deploy`
  - [ ] `firebase:serve`
  - [ ] `firebase:emulators`
  - [ ] `firebase:init`

## Implementation Order

1. **Phase 1**: Core Firebase Setup
   - Firebase installer
   - Basic configuration templates
   - Environment variables

2. **Phase 2**: Authentication
   - Firebase Auth installer
   - Auth context and hooks
   - Replace NextAuth implementations

3. **Phase 3**: Database
   - Firestore installer
   - Type definitions
   - Replace Prisma implementations

4. **Phase 4**: CLI Integration
   - Update prompts
   - Package selection logic
   - Compatibility checks

5. **Phase 5**: Templates & Examples
   - Update example components
   - Update tRPC routers
   - Create new examples

6. **Phase 6**: Deployment
   - Firebase Hosting setup
   - Build configuration
   - Deployment scripts

7. **Phase 7**: Documentation & Testing
   - Update all documentation
   - Comprehensive testing
   - Bug fixes

## Progress Tracking

### Current Status: Completed Phase 1, Phase 2, Starting Phase 3

#### Phase 1 Progress (COMPLETED):
- [x] Created migration plan document
- [x] Created Firebase installer (firebase.ts)
- [x] Set up configuration templates (firebase.json, .firebaserc, firestore rules)
- [x] Environment variable setup (with-firebase.js, with-firebase-auth.js)

#### Phase 2 Progress (COMPLETED):
- [x] Created Firebase Auth installer (firebaseAuth.ts)
- [x] Created Auth context and hooks (AuthContext.tsx)
- [x] Created auth components (LoginForm, UserProfile, ProtectedRoute)
- [x] Set up Firebase Admin SDK initialization

#### Phase 3 Progress (IN PROGRESS):
- [x] Created Firestore installer (firestore.ts)
- [x] Created Firestore type definitions and helpers
- [x] Created database utility functions
- [ ] Replace Prisma implementations in example routes

#### Phase 4 Progress (PARTIALLY COMPLETED):
- [x] Updated CLI prompts to include Firebase options
- [x] Updated package selection logic
- [x] Added Firebase to dependency version map
- [x] Updated installer index to include Firebase packages

---

## Notes

- Keep backward compatibility where possible
- Provide clear migration guides for existing users
- Ensure type safety is maintained throughout
- Test each phase thoroughly before moving to the next