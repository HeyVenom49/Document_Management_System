# Document Management System

A backend API for a document management system built with Bun, Express, TypeScript, PostgreSQL, Drizzle ORM, JWT authentication, Cloudinary file storage, and Zod validation.

## Implemented So Far

- Express application bootstrap with centralized route registration and error handling.
- PostgreSQL connection using `pg` and Drizzle ORM.
- Drizzle schema groundwork for users, folders, and documents.
- Docker Compose setup for local PostgreSQL.
- Authentication module:
  - Register users with hashed passwords using Argon2.
  - Login users and issue JWT access tokens.
  - Fetch the authenticated user's profile with `Bearer` token auth.
- Folder module:
  - Create folders for authenticated users.
  - Support optional nested folders through `parentId`.
  - Validate folder ownership before creating child folders.
  - List folders owned by the authenticated user.
- Document module:
  - Upload files with Multer.
  - Store uploaded files in Cloudinary.
  - Persist document metadata in PostgreSQL.
  - Optionally attach documents to folders.
  - Validate folder ownership before upload.
  - List documents owned by the authenticated user.
  - Fetch a document by id.
- Shared middleware and utilities:
  - JWT generation and verification.
  - Auth middleware that attaches `req.user`.
  - File upload middleware.
  - Cloudinary upload helper.
  - Custom application errors for bad request, unauthorized, forbidden, and not found cases.

## Tech Stack

- Runtime: Bun
- Server: Express 5
- Language: TypeScript
- Database: PostgreSQL
- ORM: Drizzle ORM
- Validation: Zod
- Authentication: JSON Web Tokens
- Password hashing: Argon2
- File uploads: Multer
- File storage: Cloudinary

## Project Structure

```text
src/
  app.ts                         # Express app setup
  server.ts                      # Server startup and database connection
  routes/index.ts                # Mounted API routes
  config/                        # Environment, logger, Cloudinary config
  database/                      # Drizzle database connection and schemas
  common/
    errors/                      # Custom AppError classes
    middleware/                  # Auth, validation, upload, error middleware
    utils/                       # JWT and Cloudinary helpers
  modules/
    auth/                        # Register, login, current user
    users/                       # User repository/service groundwork
    folders/                     # Folder APIs
    documents/                   # Document upload and lookup APIs
    documents-versions/          # Version module groundwork
    tags/                        # Tag module groundwork
    permisssions/                # Permission module groundwork
    audit/                       # Audit module groundwork
```

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
ENVIRONMENT=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dms
POSTGRES_DB=dms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

JWT_ACCESS_TOKEN=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRE=1d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

```bash
bun install
```

## Database Setup

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Generate and run Drizzle migrations:

```bash
bun run db:generate
bun run db:migrate
```

You can also push the schema directly during local development:

```bash
bun run db:push
```

Open Drizzle Studio:

```bash
bun run studio
```

## Running The App

Development mode with watch:

```bash
bun run dev
```

Build TypeScript:

```bash
bun run build
```

Run the compiled app:

```bash
bun run start
```

The server defaults to `http://localhost:3000` when `PORT` is not set.

## API Endpoints

Routes currently mounted in `src/routes/index.ts`:

### Auth

| Method | Endpoint         | Auth | Description                        |
| ------ | ---------------- | ---- | ---------------------------------- |
| POST   | `/auth/register` | No   | Create a new user                  |
| POST   | `/auth/login`    | No   | Login and receive an access token  |
| GET    | `/auth/me`       | Yes  | Get the authenticated user profile |

Register body:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

Login body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Folders

| Method | Endpoint  | Auth | Description                            |
| ------ | --------- | ---- | -------------------------------------- |
| POST   | `/folder` | Yes  | Create a folder                        |
| GET    | `/folder` | Yes  | List folders owned by the current user |

Create folder body:

```json
{
  "name": "Invoices",
  "parentId": null
}
```

### Documents

| Method | Endpoint            | Auth | Description                              |
| ------ | ------------------- | ---- | ---------------------------------------- |
| POST   | `/documents/upload` | Yes  | Upload a document file                   |
| GET    | `/documents`        | Yes  | List documents owned by the current user |
| GET    | `/documents/:id`    | Yes  | Get a document by id                     |

Upload documents as `multipart/form-data`:

| Field    | Type           | Required | Description                         |
| -------- | -------------- | -------- | ----------------------------------- |
| file     | File           | Yes      | File to upload                      |
| folderId | String or null | No       | Folder id to attach the document to |

Authenticated requests must include:

```http
Authorization: Bearer <accessToken>
```

## Available Scripts

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun run dev`         | Start the server in watch mode                |
| `bun run build`       | Compile TypeScript                            |
| `bun run start`       | Run compiled JavaScript from `dist/server.js` |
| `bun run db:generate` | Generate Drizzle migration files              |
| `bun run db:migrate`  | Run Drizzle migrations                        |
| `bun run db:push`     | Push schema changes to the database           |
| `bun run studio`      | Open Drizzle Studio                           |

## Notes

- Tag, version, permission, share, and audit-related folders/files exist as groundwork, but their API routes are not currently mounted.
- `documents-versions`, `tags`, `permisssions`, and `audit` modules should be completed and wired into `src/routes/index.ts` when their endpoints are ready.
- The folder route is currently mounted as `/folder`.
