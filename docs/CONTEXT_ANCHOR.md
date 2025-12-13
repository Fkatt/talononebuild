# TalonForge - Context Anchor (Long Term Memory)

**Last Updated:** 2025-12-13
**Version:** 3.0 (Production Ready - TypeScript Enhanced)

---

## Global Configuration Map

### Environment Variables

| Variable | Consumed By | Purpose | Example Value |
|----------|-------------|---------|---------------|
| DATABASE_URL | server/src/config/index.ts | PostgreSQL connection string | postgresql://user:pass@localhost:5432/talonforge |
| ENCRYPTION_KEY | server/src/config/index.ts | AES-256 key for encrypting API credentials | (32-byte random string) |
| JWT_SECRET | server/src/config/index.ts | JWT token signing | (64-byte random string) |
| PORT | server/src/config/index.ts | Backend server port | 3000 |
| NODE_ENV | server/src/config/index.ts | Environment mode | development/production |
| VITE_API_BASE_URL | client/src/config.ts | Backend API base URL | http://localhost:3000 |

---

## Architecture Tree

```
/talonforge
  /client                     # React + Vite + TypeScript Frontend
    /src
      /components
        /layout              # Sidebar, LayoutDashboard
        /shared              # Card, Badge, Modal, Button
        /views               # Dashboard, InstanceManager, etc.
      /context               # AuthContext, NotificationContext
      /api                   # Axios instance
      /hooks                 # useInstances, useMigration (React Query)
      config.ts              # Frontend configuration
    Dockerfile
    nginx.conf
    package.json

  /server                    # Node.js + Express + TypeScript Backend
    /src
      /config                # Centralized configuration (index.ts)
      /models                # Prisma client exports
      /services              # Business logic (auth, instance, migration, ai)
      /routes                # Express route handlers
      /middleware            # Auth, error handling
      /utils                 # Response wrapper, encryption
      index.ts               # Express server entry point
    /prisma
      schema.prisma          # Database schema
      seed.ts                # Default user and settings
    /logs                    # Winston log files
    Dockerfile
    package.json

  /scripts                   # Deployment & Verification Scripts
    verify_phase_1.sh        # Phase 1 verification
    verify_phase_2.ts        # Phase 2 API tests
    verify_phase_3.sh        # Phase 3 build check
    refresh_context.sh       # Context regeneration
    setup-coolify.sh         # Coolify deployment automation

  /docs                      # Documentation
    CONTEXT_ANCHOR.md        # THIS FILE
    PHASE_1_SUMMARY.md       # Phase deliverables
    PHASE_2_SUMMARY.md
    PHASE_3_SUMMARY.md

  docker-compose.yml         # Coolify orchestration
  .env.example               # Environment template
  TalonForge_AI_Build_Manifest.md
```

---

## API Registry

### Authentication Endpoints
- `POST /auth/login` - User login
  - Payload: `{ email: string, password: string }`
  - Returns: `{ success: true, data: { token: string, user: {...} } }`

### Instance Management Endpoints
- `GET /instances` - List all instances
- `POST /instances` - Add new instance (runs connection test first)
- `PUT /instances/:id` - Update instance details
- `POST /instances/test` - Connection validator
  - Payload: `{ type: 'talon'|'contentful', url: string, credentials: {...} }`
- `PUT /instances/:id/bundle` - Add/remove from bundle

### Migration Endpoints
- `POST /migrate` - Trigger migration/cloning
  - Payload: `{ sourceId: number, destId: number, assets: [...] }`
- `POST /backups/create` - Create snapshot
- `POST /backups/restore` - Restore from JSON

### AI Endpoints
- `POST /ai/generate` - Generate rule JSON
- `POST /ai/enhance` - Enhance user prompt
- `POST /ai/feedback` - Log AI feedback

### Admin Endpoints
- `GET /admin/logs` - Retrieve application logs (last 100 lines)

---

## Current Phase Status

**Phase 0.5:** IN PROGRESS
**Phase 1:** PENDING
**Phase 2:** PENDING
**Phase 3:** PENDING
**Phase 4:** PENDING

---

## Notes & Decisions

- Using Prisma ORM for type-safe database access
- All API responses follow standardized wrapper format
- Credentials encrypted with AES-256 (IV:ciphertext format)
- React Query for frontend data fetching/caching
- Winston for structured JSON logging
- TypeScript throughout for type safety

---

## TODO Markers

(This section will be updated by refresh_context.sh)

---

## Integration Notes

### Talon.One SDK
- Documentation: https://docs.talon.one/management-api
- SDK: `talon-one` npm package
- Auth: Bearer token via Management API Key

### Contentful SDK
- Documentation: https://www.contentful.com/developers/docs/references/content-management-api/
- SDK: `contentful-management` npm package
- Auth: Personal Access Token or OAuth

