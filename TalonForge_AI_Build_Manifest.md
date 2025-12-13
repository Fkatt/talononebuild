TalonForge AI Build Manifest

Version: 3.0 (Production Ready - TypeScript Enhanced)
Role: Senior Full-Stack Architect & DevOps Engineer
Objective: Build "TalonForge"—an enterprise environment manager for Talon.One and Contentful.

00. AI Agent Prime Directives (The Contract)

CRITICAL INSTRUCTION: You are bound by the following operational rules. Read these before executing any task.

No Placeholders: Never generate code with // TODO: Implement this later or pass. All code must be functional, error-handled, and production-ready.

Atomic Execution: Complete one Phase entirely and run its Validation Checkpoint before moving to the next. Do not jump ahead.

Context Hygiene: You must maintain the docs/CONTEXT_ANCHOR.md file. If you add a new env var or endpoint, record it there immediately.

Security First: Never hardcode secrets. Always use process.env. Ensure the database seeder uses the default credentials provided in the plan.

Self-Correction: If a Validation Checkpoint fails, you must attempt to fix the error yourself using the "Correction Instructions" provided. Do not ask the user for help unless you are stuck for more than 3 attempts.

Tooling Usage: Use your connected MCP tools (Postgres, Fetch, Ripgrep) to verify reality. Do not guess the state of the database; query it.

1. Project Overview & Architecture

Target Deployment: Local Coolify Instance.

Tech Stack

Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide React. State Management: TanStack Query (React Query).

Backend: Node.js (Express), TypeScript.

Database & ORM:

PostgreSQL (via Coolify).

Prisma ORM (Critical for robust schema management and type safety).

Containerization: Docker.

0. Phase 0: Pre-requisites & User Inputs

Agent Instructions: Before starting the build, you must prompt the user for these specific details or generate placeholders in a .env.example file.

Required User Info (Coolify Context)

Coolify Database Credentials: Since Coolify creates the DB, the agent needs the DATABASE_URL provided by the Coolify UI after the user adds a PostgreSQL resource.

Coolify Domain/Port: Where will the frontend be accessible? (e.g., http://localhost:8000 or https://talonforge.local).

Automated Setup Goals

The agent must generate scripts to handle the following automatically:

Security Keys: Generate random 32-byte strings for ENCRYPTION_KEY and JWT_SECRET.

Docker Networking: Ensure the docker-compose.yml networks match what Coolify expects (if using Coolify's internal network).

0.1. Phase 0.1: Agent Tooling Strategy (MCP)

Recommendation for User: Connect these MCP Servers to your coding environment before starting to reduce iterations and errors.

PostgreSQL MCP:

Usage: Validating migrations and checking seed data.

Efficiency: Eliminates the need for writing temporary verification scripts. The agent can verify "Did the User table get created?" with a single tool call.

Fetch/Web Search MCP:

Usage: Looking up the latest method signatures for talon-one and contentful-management SDKs.

Reliability: Prevents usage of deprecated API methods.

Mandatory Reference URLs:

Talon.One Management API: https://docs.talon.one/management-api

Contentful Management API: https://www.contentful.com/developers/docs/references/content-management-api/

Filesystem (with Ripgrep) MCP:

Usage: Fast codebase navigation without overloading context context.

0.5. Phase 0.5: Autonomy & Context Protocols

1. The Context Anchor (docs/CONTEXT_ANCHOR.md)

You must initialize and maintain a file named docs/CONTEXT_ANCHOR.md. This file acts as your "Long Term Memory".

Structure:

Global Config Map: A table listing every Environment Variable and which file/module consumes it.

Architecture Tree: A file tree visualization updated every time you add a module.

API Registry: A list of all implemented backend endpoints and their required payloads.

Rule: Before starting a new task, read docs/CONTEXT_ANCHOR.md. After finishing a task, update it.

2. The Context Refresher Script (scripts/refresh_context.sh)

Efficiency Upgrade: Create a script that uses tree and ripgrep to generate a lightweight map of the project.

Instruction: When getting stuck or "looping", run this script to re-orient yourself with the current file structure and TODO markers.

3. Centralized Configuration Pattern

Backend: Create server/src/config/index.ts. ALL process.env calls must happen here. Export typed configuration objects (e.g., dbConfig, talonConfig). NEVER use process.env inside service logic.

Frontend: Create client/src/config.ts. Centralize API base URLs and feature flags here.

4. Strict Typing (TypeScript)

Backend: Use .ts files. Define Interfaces for all API Payloads and Service Returns (e.g., interface MigrationResult).

Frontend: Use .tsx files. Define Props interfaces for all Components.

5. Self-Verification Protocol (The "No Babysitting" Rule)

You must create a script scripts/verify_phase.ts at the start.

Rule: You are NOT allowed to mark a Phase as complete until you have run a verification script that confirms the code compiles and the server starts.

2. Phase 1: Scaffolding & Environment Setup

Agent Instructions:

Initialize Monorepo Structure:

/talonforge
  /client (React + Vite + TS)
  /server (Node.js + Express + TS)
  /scripts (Deployment, Setup, Verification)
  /docs (Documentation & Context Anchor)
  docker-compose.yml


Frontend Setup:

Initialize client with npm create vite@latest . -- --template react-ts.

Install dependencies: lucide-react, axios, react-router-dom, clsx, tailwind-merge, @tanstack/react-query.

Tooling: Install eslint, prettier.

Setup Tailwind CSS.

Backend Setup:

Initialize server.

Install dependencies:

express, cors, dotenv, axios, crypto-js (Encryption).

multer (File uploads).

prisma, @prisma/client (Database ORM).

jsonwebtoken, bcryptjs (Auth).

winston (Structured Logging).

Dev Deps: typescript, ts-node, @types/express, @types/node.

API Client Libraries:

talon-one (Official Node.js SDK).

contentful-management (Official Contentful SDK).

Dev Experience & Efficiency Tooling:

Install ripgrep and tree in the local dev environment (via package.json scripts or checking for binary existence) to allow the "Context Refresher" script to work efficiently.

📝 Phase 1 Documentation Deliverable

Create: docs/PHASE_1_SUMMARY.md.

Content: Instructions on how to start dev servers locally. List of all dependencies installed.

Update: docs/CONTEXT_ANCHOR.md with the initial folder structure.

🔍 Phase 1 Automated Verification

Agent Action: Create scripts/verify_phase_1.sh.

Logic: Checks if node_modules exists. Checks if npm run lint passes. Checks if tsc compiles without error.

Correction: If lint/type errors exist, fix them.

3. Phase 2: Backend Development (Core Logic)

The backend acts as a secure proxy and orchestration layer. It must handle the "Protected Mode" logic server-side.

A. Database Schema & Seeding (Prisma)

Agent Instructions:

Create schema.prisma with these models:

Model User: id (Int, PK), email (String, Unique), passwordHash (String), role (String, default: 'Admin'), createdAt (DateTime).

Model Instance: id (Int, PK), name (String), type (String: 'talon'|'contentful'), region (String), url (String), encryptedCredentials (String), bundleId (String?), userId (Int, FK).

Model SystemSettings: id (Int, PK), aiProvider (String), aiConfig (Json), docLinks (Json).

Create server/prisma/seed.ts: This is CRITICAL. It must create a default user (admin@talonforge.io / admin123) and default SystemSettings so the app is usable immediately.

B. Standardized API Response Wrapper

To prevent integration errors, create server/src/utils/response.ts.

Success Structure: { success: true, data: { ... }, timestamp: ISOString }

Error Structure: { success: false, error: { code: "AUTH_FAIL", message: "..." } }

Instruction: All endpoints MUST use this wrapper.

C. Instance Manager (Crucial)

Logic:

Encryption: API Keys MUST be stored encrypted using AES-256 before saving to encryptedCredentials. Store the IV (Initialization Vector) alongside the encrypted string (e.g., iv:ciphertext) to ensure decryption works reliably.

Bundles: Implement logic to tag instances with a bundleId to form "Gigastores".

Endpoints:

GET /instances: List instances visible to the user.

POST /instances: Add new instance. Must run Connection Test before saving.

PUT /instances/:id: Update instance details (URL, Credentials). Allows changing API keys if rotated.

POST /instances/test: Connection Validator. Receives { type, url, credentials }. Attempts to authenticate with the vendor API and returns { success: true } or { success: false, error: "Invalid API Key" }. This separates config logic from connection logic.

PUT /instances/:id/bundle: Add/Remove from bundle.

D. The Migration & Backup Engine

Endpoints:

POST /migrate: Trigger cloning.

POST /backups/create: Create snapshot of instance.

POST /backups/restore: Restore from JSON file.

Payload: { sourceId, destId, assets: [{ type, id }] }

Logic:

Fetch Source: Get definitions via SDKs.

Dependency Check: Scan for missing Attributes/Content Types.

Validation: Return 409 if schemas don't match.

Execution: POST data to Destination.

E. AI Proxy & Tuning

Endpoints:

POST /ai/generate: Generates rule JSON.

POST /ai/enhance: Rewrites user prompt (Magic Wand feature).

POST /ai/feedback: Log user rating.

Logic:

Inject Schema context (e.g., list of attributes from the active Talon instance) into the LLM prompt to ensure the AI generates valid field names.

F. Observability & Logging (For AI Debugging)

Agent Instructions: Implement a logging system that is easy for an AI agent to parse when troubleshooting.

Logger: Use winston to write logs to server/logs/app.log (JSON format).

Endpoint: GET /admin/logs: (Protected) Reads the last 100 lines of app.log.

🔍 Phase 2 Automated Verification

Agent Action: Create scripts/test_backend_routes.ts using axios.

Tests:

POST /auth/login with seed credentials -> Should return 200 + JWT.

GET /instances with JWT -> Should return 200 + array.

POST /instances/test with fake credentials -> Should return 200 (Success boolean false), NOT 500 error.

4. Phase 3: Frontend Refactoring

Agent Instructions: Break down TalonForgeConsole.jsx into a modular structure:

/src
  /components
    /layout (Sidebar, LayoutDashboard)
    /shared (Card, Badge, Modal, Button)
    /views (Dashboard, InstanceManager, MigrationHub, BackupVault, LoyaltyHub, AIArchitect, Admin)
  /context (AuthContext, NotificationContext)
  /api (axios instance connecting to Backend)
  /hooks (useInstances, useMigration - utilizing React Query)



Specific UI Requirements:

React Query: Use useQuery for fetching lists (instances, backups) and useMutation for actions (login, migrate). This manages loading/error states automatically.

Test Connection: Include a "Test Connection" button in the Add/Edit Instance modal that calls POST /instances/test and displays a green check or red error message before saving.

🔍 Phase 3 Automated Verification

Agent Action: Update scripts/verify_phase.ts to run npm run build in /client.

Success: Build output folder (dist/) exists and contains index.html.

5. Phase 4: Deployment to Coolify

Agent Instructions: Create the necessary configurations and an automation script for easy setup.

1. Backend Dockerfile (/server/Dockerfile)

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies including devDependencies for Prisma generation and TS build
RUN npm install
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build TypeScript
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]


2. Frontend Dockerfile (/client/Dockerfile)

FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


3. Coolify Configuration (docker-compose.yml)

version: '3.8'
services:
  tf-backend:
    build: ./server
    environment:
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL} # Provided by Coolify Service
      - ENCRYPTION_KEY=${ENCRYPTION_KEY} # Generated by setup script
      - JWT_SECRET=${JWT_SECRET} # Generated by setup script
    depends_on:
      - tf-db
    networks:
      - talonforge-net

  tf-frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - tf-backend
    networks:
      - talonforge-net

  # Optional: Internal DB if not using Coolify Managed Postgres
  tf-db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=talonforge
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    networks:
      - talonforge-net

networks:
  talonforge-net:
    driver: bridge

volumes:
  pgdata:


4. Setup Automation Script (setup-coolify.sh)

Agent Instructions: Generate a bash script to runs locally to prepare the environment variables.

Logic:

Check for .env.

Generate random 32-char string for ENCRYPTION_KEY.

Generate random 64-char string for JWT_SECRET.

Ask user for DATABASE_URL (if external) or default to internal Docker DNS.

Write to .env and print "Ready for Coolify Deployment".

7. User Prompt Sequence (The Driver)

Instructions: Copy and paste these prompts into your coding agent (Claude) one by one. Do not proceed to the next prompt until the verification step passes.

Prompt 1 (Initialization):
"I have a comprehensive build plan for TalonForge. Please read the TalonForge_AI_Build_Manifest.md carefully. Start by initializing Phase 0.5 (Context) and Phase 1 (Scaffolding). Generate the project structure, CONTEXT_ANCHOR.md, the config files, and the Phase 1 Verification script. Do not write backend logic yet."

Prompt 2 (Backend Core):
"Phase 1 is verified. Now execute Phase 2. Set up the Prisma Schema, the Seeder, and the core Authentication/Instance services using TypeScript. Ensure talon-one SDK integration handles JWT sessions. Run the Phase 2 Verification script before stopping."

Prompt 3 (Frontend Wiring):
"Phase 2 is verified. Execute Phase 3. Refactor the provided TalonForgeConsole.jsx into a modular React + TypeScript structure. Use React Query for all data fetching. Ensure the 'Test Connection' button in the UI actually calls the backend API."

Prompt 4 (Deployment):
"Phase 3 is verified. Execute Phase 4. Create the Dockerfiles and setup-coolify.sh. Ensure the Dockerfiles compile the TypeScript correctly. Verify the docker-compose config."