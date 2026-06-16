# Document Management System

A Bun + Express backend API for managing users, folders, documents, versions, sharing, tags, and audit activity. The API uses PostgreSQL with Drizzle ORM, JWT authentication, HttpOnly refresh cookies, Zod validation, Multer uploads, and Cloudinary for file storage.

## Features

- User authentication with registration, login, JWT access tokens, and current-user profile lookup.
- HttpOnly refresh cookies with rotation, server-side storage, and 30-day expiration.
- Logout that revokes the current refresh token and clears the cookie.
- Rate limiting on register, login, and refresh endpoints.
- Password hashing with Argon2.
- Protected routes through Bearer token authentication.
- Role-based document access for owners and shared users (`viewer` / `editor`).
- Health checks for liveness and database readiness.
- Folder management with optional nested `parentId`.
- Document upload, listing, search, download, update, and folder filtering.
- Soft delete with trash listing and restore.
- Permanent delete with Cloudinary cleanup for the document and all versions.
- Document versioning with upload, listing, download, and restore.
- Document sharing with viewer/editor permissions and a shared-documents feed.
- Tags and per-document tag assignment.
- Audit logging for uploads, downloads, sharing, versions, tags, and permanent deletes.
- Cloudinary-backed storage with signed file URLs and time-limited download redirects.
- Upload validation by extension, MIME type, and magic bytes.
- Centralized validation, error handling, and custom application errors.
- PostgreSQL schema and migrations managed with Drizzle Kit.
- Tests for auth, health, folders, documents, versions, sharing, tags, audit, and shared utilities.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Runtime | Bun |
| Server | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Authentication | JSON Web Tokens |
| Password hashing | Argon2 |
| File uploads | Multer |
| File storage | Cloudinary |
| Security | Helmet, CORS, express-rate-limit, cookie-parser |
| Tests | Bun test |

## Prerequisites

- [Bun](https://bun.sh) / [Node](https://nodejs.org)
- Docker (for local PostgreSQL)
- A Cloudinary account

## Project Structure

```text
src/
  app.ts                           # Express app setup (Helmet, CORS, cookies, routes)
  server.ts                        # Server startup and database connection
  routes/index.ts                  # Mounted API routes
  config/                          # Environment, logger, and Cloudinary config
  database/
    index.ts                       # Pool, Drizzle client, health check
    schema/                        # users, folders, documents, versions, shares, tags, audit, refresh tokens
  common/
    access/                        # Document access and ownership helpers
    constants/                     # Shared constants such as audit actions
    errors/                        # Custom AppError classes
    http/                          # Response helpers, route wrapper, request helpers
    middleware/                    # Auth, upload, rate limit, and error middleware
    schemas/                       # Shared Zod param schemas
    utils/                         # JWT, Cloudinary, cookies, download, and file helpers
  modules/
    auth/                          # Register, login, refresh, logout, and current-user APIs
    users/                         # User repository
    health/                        # Liveness and readiness endpoints
    folders/                       # Folder APIs
    documents/                     # Document upload, lookup, trash, sharing feed, and delete APIs
    documents-versions/            # Document version upload, list, download, and restore APIs
    share/                         # Document sharing APIs
    tags/                          # Tag and document-tag APIs
    audit/                         # Document activity APIs

test/
  helpers/                         # Shared test utilities
  auth/                            # Auth controller and service tests
  health/                          # Health controller tests
  folders/                         # Folder controller tests
  documents/                       # Document controller, service, and repository tests
  documents-versions/              # Version controller, service, and repository tests
  share/                           # Document share controller tests
  tags/                            # Tag controller tests
  audit/                           # Audit controller and service tests
  common/                          # Shared utility tests
```

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
ENVIRONMENT=development
CORS_ORIGIN=http://localhost:5173

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

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `PORT` | No | Server port. Defaults to `3000`. |
| `ENVIRONMENT` | No | Set to `production` to enable secure refresh cookies. |
| `CORS_ORIGIN` | No | Comma-separated allowed origins. Defaults to all origins when unset. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `JWT_ACCESS_TOKEN` | Yes | Secret used to sign access tokens. |
| `JWT_ACCESS_TOKEN_EXPIRE` | Yes | Access token lifetime (for example `1d`, `15m`). |
| `CLOUDINARY_*` | Yes | Cloudinary credentials for uploads and signed URLs. |

## Installation

```bash
bun install
```

## Database Setup

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

Generate and apply Drizzle migrations:

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

Run the full test suite:

```bash
bun run test
```

## API Response Format

Successful responses:

```json
{ "success": true, "data": {} }
```

```json
{ "success": true, "message": "..." }
```

Paginated search responses:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Error responses:

```json
{ "success": false, "message": "..." }
```

Validation errors also include a Zod `errors` array.

## Authentication

Protected endpoints require an access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

On login, the API returns an access token in the response body and stores the refresh token in an HttpOnly cookie named `refresh_token`. The cookie is scoped to `/auth`, uses `SameSite=Strict`, and is marked `Secure` when `ENVIRONMENT=production`.

Browser clients must send credentials on auth requests:

```js
fetch("http://localhost:3000/auth/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

Use `POST /auth/refresh` to rotate the refresh cookie and receive a new access token. Each refresh request invalidates the previous refresh token. `POST /auth/logout` revokes the refresh token and clears the cookie.

For non-browser clients, `POST /auth/refresh` and `POST /auth/logout` also accept a `refreshToken` field in the request body as a fallback.

Refresh tokens expire after 30 days. Register, login, and refresh are rate-limited to 20 requests per 15 minutes per IP.

Password rules on registration:

- Minimum 8 characters
- At least one letter
- At least one number

## Access Control

| Role | Capabilities |
| ---- | ------------ |
| Owner | Full control over owned documents, folders, and tags |
| Shared `viewer` | Read and download shared documents and versions |
| Shared `editor` | Viewer access plus upload versions, restore versions, and manage document tags |

Owners always have full access to their own documents.

## File Uploads

Supported file types: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`

- Maximum file size: 10 MB
- Files are validated by extension, MIME type, and magic bytes
- Uploads are stored in Cloudinary under the `dms` folder
- List/detail responses include signed file URLs
- Download endpoints return a `302` redirect to a time-limited signed Cloudinary URL

## API Endpoints

Routes are mounted at the server root from `src/routes/index.ts` (no `/api` prefix).

### Health

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/health` | No | Liveness check |
| GET | `/health/ready` | No | Readiness check with database status |

Liveness response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-06-16T12:00:00.000Z"
  }
}
```

Readiness returns `503` when the database is unavailable.

### Auth

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/auth/register` | No | Create a new user |
| POST | `/auth/login` | No | Login and receive an access token plus refresh cookie |
| GET | `/auth/me` | Yes | Get the authenticated user |
| POST | `/auth/refresh` | No | Rotate the refresh cookie and issue a new access token |
| POST | `/auth/logout` | No | Revoke the current refresh token and clear the cookie |

Register body:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

Register response:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "john",
    "email": "john@example.com",
    "createdAt": "2026-06-16T12:00:00.000Z"
  }
}
```

Login body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Login response:

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Refresh response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Logout response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Folders

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/folder` | Yes | Create a folder |
| GET | `/folder` | Yes | List folders owned by the current user |

Create folder body:

```json
{
  "name": "Invoices",
  "parentId": null
}
```

`parentId` is optional. When provided, it must be a valid UUID for a folder owned by the authenticated user.

### Documents

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/documents/upload` | Yes | Upload a document file |
| GET | `/documents` | Yes | List documents owned by the current user |
| GET | `/documents/search` | Yes | Search documents with pagination |
| GET | `/documents/folder/:folderId` | Yes | List documents in a folder |
| GET | `/documents/trash` | Yes | List soft-deleted documents |
| GET | `/documents/shared` | Yes | List documents shared with the current user |
| GET | `/documents/:documentId` | Yes | Get a document by id |
| GET | `/documents/:documentId/download` | Yes | Download the current document file |
| PATCH | `/documents/:documentId` | Yes | Update document metadata |
| POST | `/documents/:documentId/restore` | Yes | Restore a document from trash |
| DELETE | `/documents/:documentId` | Yes | Soft-delete a document into trash |
| DELETE | `/documents/:documentId/permanent` | Yes | Permanently delete a trashed document |

Upload documents as `multipart/form-data`:

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| file | File | Yes | File to upload |
| folderId | String or null | No | Folder id to attach the document to |

Update document body:

```json
{
  "name": "Updated filename.pdf",
  "folderId": null
}
```

At least one update field must be provided. `folderId` can be a valid folder UUID or `null` to move the document out of a folder.

Soft delete moves the document to trash without removing Cloudinary assets. Permanent delete requires the document to already be in trash, removes all Cloudinary assets for the document and its versions, removes shares, hard-deletes the database record, and writes an audit log.

Search query parameters:

| Param | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| search | String | No | Filter documents by name |
| page | Number | No | Page number, defaults to `1` |
| limit | Number | No | Page size, defaults to `10`, max `100` |

Example:

```http
GET /documents/search?search=contract&page=1&limit=10
```

Shared documents include `sharePermission` (`viewer` or `editor`) and `sharedAt` in addition to the normal document fields.

### Document Versions

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/documents/:documentId/versions` | Yes | Upload a new document version |
| GET | `/documents/:documentId/versions` | Yes | List all versions |
| GET | `/documents/:documentId/versions/:versionId` | Yes | Get one version |
| GET | `/documents/:documentId/versions/:versionId/download` | Yes | Download a version file |
| POST | `/documents/:documentId/versions/:versionId/restore` | Yes | Restore document to a version |

Upload a version as `multipart/form-data`:

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| file | File | Yes | New file version |

Version upload and restore require `editor` access (owner or shared editor).

### Document Sharing

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/documents/:documentId/share` | Yes | Share a document with another user |
| DELETE | `/documents/:documentId/share/:sharedUserId` | Yes | Remove a user's access to a document |

Share body:

```json
{
  "email": "jane@example.com",
  "permission": "viewer"
}
```

`permission` accepts `viewer` or `editor` and defaults to `viewer`. Only the document owner can share or remove shares.

### Tags

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/tags` | Yes | Create a tag |
| GET | `/tags` | Yes | List tags for the current user |
| DELETE | `/tags/:tagId` | Yes | Delete a tag |

Create tag body:

```json
{
  "name": "Contracts"
}
```

### Document Tags

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/documents/:documentId/tags` | Yes | List tags on a document |
| POST | `/documents/:documentId/tags` | Yes | Attach a tag to a document |
| DELETE | `/documents/:documentId/tags/:tagId` | Yes | Remove a tag from a document |

Attach tag body:

```json
{
  "tagId": "tag-uuid"
}
```

Attach and remove require `editor` access on the document.

### Document Activity

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/documents/:documentId/activity` | Yes | List audit activity for a document |

Tracked audit actions:

- `DOCUMENT_UPLOADED`
- `DOCUMENT_DOWNLOADED`
- `DOCUMENT_PERMANENTLY_DELETED`
- `DOCUMENT_SHARED`
- `VERSION_CREATED`
- `VERSION_RESTORED`
- `VERSION_DOWNLOADED`
- `TAG_ADDED`
- `TAG_REMOVED`

## Useful Scripts

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Start the API in watch mode |
| `bun run build` | Compile TypeScript into `dist/` |
| `bun run start` | Run the compiled server |
| `bun run test` | Run the test suite |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:push` | Push schema changes during local dev |
| `bun run studio` | Open Drizzle Studio |
