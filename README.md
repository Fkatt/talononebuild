# TalonForge

**Version 3.0 - Production Ready TypeScript Edition**

TalonForge is an enterprise-grade environment manager for Talon.One and Contentful instances. It provides a unified interface for managing multiple instances, performing migrations, creating backups, and leveraging AI-powered features.

---

## Features

- **Instance Management**: Connect and manage multiple Talon.One and Contentful instances
- **Connection Testing**: Validate API credentials before saving
- **Migration Engine**: Clone assets between instances with dependency tracking
- **Backup & Restore**: Create snapshots and restore from JSON backups
- **AI Architect**: AI-powered rule generation and prompt enhancement (extensible)
- **Bundle Support**: Group instances into "Gigastores" for coordinated operations
- **Secure Credentials**: AES-256 encryption for all API keys
- **Role-Based Access**: User authentication with JWT tokens
- **Structured Logging**: Winston JSON logs for easy debugging

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Encryption**: crypto-js (AES-256)
- **Logging**: Winston

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Target Platform**: Coolify (self-hosted PaaS)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talononebuild
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   cd ..
   ```

3. **Setup environment variables**
   ```bash
   # Run the setup script
   ./scripts/setup-coolify.sh

   # Or manually copy .env.example files
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Setup database**
   ```bash
   cd server

   # Run Prisma migrations
   npx prisma migrate dev

   # Seed database with default admin user
   npx prisma db seed
   ```

5. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Default credentials: `admin@talonforge.io` / `admin123`

---

## Docker Deployment

### Using Docker Compose

1. **Generate environment variables**
   ```bash
   ./scripts/setup-coolify.sh
   ```

2. **Build and run**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   docker exec talonforge-backend npx prisma migrate deploy
   docker exec talonforge-backend npx prisma db seed
   ```

4. **Access the application**
   - Application: http://localhost
   - API: http://localhost:3000

### Deploying to Coolify

1. Create a new service in Coolify
2. Connect your Git repository
3. (Optional) Add a PostgreSQL resource in Coolify
4. Copy the `DATABASE_URL` from Coolify
5. Run `./scripts/setup-coolify.sh` and provide the DATABASE_URL
6. Push environment variables to Coolify
7. Deploy!

---

## Project Structure

```
talononebuild/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client and services
│   │   ├── components/
│   │   │   ├── layout/    # Sidebar, Layout
│   │   │   ├── shared/    # Card, Badge, Button, Modal
│   │   │   └── views/     # Dashboard, InstanceManager, etc.
│   │   ├── context/       # Auth, Notification contexts
│   │   ├── hooks/         # React Query hooks
│   │   └── config.ts      # Frontend configuration
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Centralized configuration
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Prisma client
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Response wrapper, encryption, logger
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeder
│   └── Dockerfile
│
├── scripts/               # Automation scripts
│   ├── verify_phase_1.sh
│   ├── verify_phase_2.ts
│   └── setup-coolify.sh
│
├── docs/                  # Documentation
│   ├── CONTEXT_ANCHOR.md
│   ├── PHASE_1_SUMMARY.md
│   └── PHASE_2_SUMMARY.md
│
└── docker-compose.yml
```

---

## API Documentation

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@talonforge.io",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": 1,
      "email": "admin@talonforge.io",
      "role": "Admin"
    }
  },
  "timestamp": "2025-12-13T10:00:00.000Z"
}
```

### Instance Management

All instance endpoints require authentication via Bearer token.

#### GET /instances
List all instances for the authenticated user.

#### POST /instances
Create a new instance (runs connection test first).

#### POST /instances/test
Test connection to an instance without saving.

#### PUT /instances/:id
Update instance details.

#### DELETE /instances/:id
Delete an instance.

#### PUT /instances/:id/bundle
Assign instance to a bundle (Gigastore).

---

## Environment Variables

### Backend (.env)

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/talonforge
ENCRYPTION_KEY=<32-byte-hex-string>
JWT_SECRET=<64-byte-hex-string>
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:3000
```

---

## Security

- **Credentials Encryption**: All API keys are encrypted with AES-256 before database storage
- **JWT Authentication**: All protected routes require valid JWT tokens
- **Password Hashing**: User passwords hashed with bcryptjs (10 rounds)
- **Environment Variables**: No secrets in code - all via environment variables
- **HTTPS Ready**: Configure reverse proxy for production HTTPS

---

## Development Workflow

### Running Tests

Phase 1 verification (checks setup):
```bash
./scripts/verify_phase_1.sh
```

Phase 2 verification (tests API endpoints):
```bash
# Ensure server is running first
cd scripts
npx ts-node verify_phase_2.ts
```

### Building for Production

Backend:
```bash
cd server
npm run build
```

Frontend:
```bash
cd client
npm run build
```

### Database Migrations

Create a new migration:
```bash
cd server
npx prisma migrate dev --name <migration_name>
```

Apply migrations to production:
```bash
npx prisma migrate deploy
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License

ISC

---

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: `docs/` directory

---

## Default Credentials

**⚠️ IMPORTANT**: Change these after first login!

- Email: `admin@talonforge.io`
- Password: `admin123`

---

## Acknowledgments

Built with the TalonForge AI Build Manifest v3.0
