# Document Management System

A Bun + Express backend API for managing users, folders, and uploaded documents. The API uses PostgreSQL with Drizzle ORM, JWT authentication, Zod validation, Multer uploads, and Cloudinary for file storage.

## Features

- User authentication with registration, login, JWT access tokens, and current-user profile lookup.
- Password hashing with Argon2.
- Protected routes through Bearer token authentication.
- Folder management for authenticated users.
- Nested folders through an optional `parentId`.
- Ownership checks before using parent folders or folder-scoped document operations.
- Document upload through `multipart/form-data`.
- Cloudinary-backed document storage with persisted metadata.
- Document listing, lookup, update, folder filtering, search, and deletion.
- Document version upload, listing, lookup, and restore.
- Cloudinary cleanup when deleting documents and all stored versions.
- Centralized validation, error handling, and custom application errors.
- PostgreSQL schema and migrations managed with Drizzle Kit.
- Controller tests for auth, folder, document, and version flows.

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
- Tests: Bun test

## Project Structure

```text
src/
  app.ts                         # Express app setup
  server.ts                      # Server startup and database connection
  routes/index.ts                # Mounted API routes
  config/                        # Environment, logger, and Cloudinary config
  database/                      # Drizzle database connection and schemas
  common/
    errors/                      # Custom AppError classes
    middleware/                  # Auth, validation, upload, and error middleware
    utils/                       # JWT and Cloudinary helpers
  modules/
    auth/                        # Register, login, and current-user APIs
    users/                       # User repository groundwork
    folders/                     # Folder APIs
    documents/                   # Document upload, lookup, update, search, and delete APIs
    documents-versions/          # Document version upload, list, lookup, and restore APIs

test/
  helpers/                       # Shared test utilities
  auth/                          # Auth controller tests
  folders/                       # Folder controller tests
  documents/                     # Document controller tests
  tsconfig.json                  # TypeScript config for tests
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

For local development, you can also push the schema directly:

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

## Testing

Run the test suite:

```bash
bun run test
```

## Authentication

Protected endpoints require an access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

## API Endpoints

Routes are mounted directly from `src/routes/index.ts`.

### Auth

| Method | Endpoint         | Auth | Description                       |
| ------ | ---------------- | ---- | --------------------------------- |
| POST   | `/auth/register` | No   | Create a new user                 |
| POST   | `/auth/login`    | No   | Login and receive an access token |
| GET    | `/auth/me`       | Yes  | Get the authenticated user        |

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

`parentId` is optional. When provided, it must be a valid UUID for a folder owned by the authenticated user.

### Documents

| Method | Endpoint                       | Auth | Description                              |
| ------ | ------------------------------ | ---- | ---------------------------------------- |
| POST   | `/documents/upload`            | Yes  | Upload a document file                   |
| GET    | `/documents`                   | Yes  | List documents owned by the current user |
| GET    | `/documents/search`            | Yes  | Search documents with pagination         |
| GET    | `/documents/folder/:folderId`  | Yes  | List documents in a folder               |
| GET    | `/documents/:id`               | Yes  | Get a document by id                     |
| PATCH  | `/documents/:id`               | Yes  | Update document metadata                 |
| DELETE | `/documents/:id`               | Yes  | Delete a document                        |

Upload documents as `multipart/form-data`:

| Field    | Type           | Required | Description                         |
| -------- | -------------- | -------- | ----------------------------------- |
| file     | File           | Yes      | File to upload                      |
| folderId | String or null | No       | Folder id to attach the document to |

Update document body:

```json
{
  "name": "Updated filename.pdf",
  "folderId": null
}
```

At least one update field must be provided. `folderId` can be a valid folder UUID or `null` to move the document out of a folder.

Delete response:

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

Search query parameters:

| Param  | Type   | Required | Description                    |
| ------ | ------ | -------- | ------------------------------ |
| search | String | No       | Filter documents by name       |
| page   | Number | No       | Page number, defaults to `1`   |
| limit  | Number | No       | Page size, defaults to `10`    |

Example:

```http
GET /documents/search?search=contract&page=1&limit=10
```

### Document Versions

| Method | Endpoint                                              | Auth | Description                    |
| ------ | ----------------------------------------------------- | ---- | ------------------------------ |
| POST   | `/documents/:documentId/versions`                     | Yes  | Upload a new document version    |
| GET    | `/documents/:documentId/versions`                     | Yes  | List all versions              |
| GET    | `/documents/:documentId/versions/:versionId`          | Yes  | Get one version                |
| POST   | `/documents/:documentId/versions/:versionId/restore`  | Yes  | Restore document to a version  |

Upload a version as `multipart/form-data`:

| Field | Type | Required | Description      |
| ----- | ---- | -------- | ---------------- |
| file  | File | Yes      | New file version |

Restore response:

```json
{
  "success": true,
  "data": {
    "id": "document-uuid",
    "currentVersion": 1,
    "fileUrl": "https://res.cloudinary.com/..."
  }
}
```

## Useful Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `bun run dev`         | Start the API in watch mode          |
| `bun run build`       | Compile TypeScript into `dist/`      |
| `bun run start`       | Run the compiled server              |
| `bun run test`        | Run controller tests                 |
| `bun run db:generate` | Generate Drizzle migrations          |
| `bun run db:migrate`  | Apply Drizzle migrations             |
| `bun run db:push`     | Push schema changes during local dev |
| `bun run studio`      | Open Drizzle Studio                  |
