# Teyvat API

An open-source REST API providing structured data on Genshin Impact characters and artifact sets, built with TypeScript and Express for developers to integrate Teyvat's world into their apps.

> **Disclaimer**  
> "Genshin Impact", "Teyvat", and all related names, logos, and assets are trademarks or registered trademarks of HoYoverse / Cognosphere.  
> This project is a community-made tool and has no official affiliation with HoYoverse. All data is fan-curated and open-source.

## Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE) with consistent JSON responses.
- **Pagination & Filtering**: Handle large datasets with query params like `?page=1&limit=10&rarity=5`.
- **Search & Sorting**: Full-text search on names/descriptions, sortable by fields like `rarity` or `region`.
- **Authentication**: tokens-based auth for protected routes; API keys for public reads to manage rate limits.
- **Rate Limiting & Security**: Built-in protection with validation, CORS, and configurable limits (e.g., 100 requests per 15 minutes).
- **Open-Source**: Hosted on GitHub with MongoDB; extensible for adding new data.

For full documentation and examples, see the [official docs website](https://docs.teyvatapi.xyz/).

## Prerequisites

- **Git**: For cloning the repo.
- **Node.js**: Version 18 or higher (download from [nodejs.org](https://nodejs.org)).
- **MongoDB**: Local instance or Atlas cloud database (get URI from [mongodb.com](https://www.mongodb.com/try/download/community)).
- **Environment Variables**: Copy `.env.example` to `.env` and fill in keys like `MONGODB_URI`, `JWT_SECRET`, etc.

## Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/fraxcco/teyvat-api.git
   cd teyvat-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create a `.env` file in the root directory.
   - Set at minimum:
     ```
     NODE_ENV=development
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/teyvat
     JWT_SECRET=your-super-secret-key-here
     API_VERSION=/v1
     ```
   - Adjust for your MongoDB setup.

4. **Run the Server**:
   - For development (with hot reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm run build
     npm start
     ```
   - Server starts on `http://localhost:3000` (check console for confirmation).

5. **Verify Setup**:
   - Ping the health endpoint:
     ```bash
     curl http://localhost:3000/v1/health
     ```
     Expected: `{"success": true, "data": {"status": "OK", ...}}`

## Usage

### Quick Start
Register an account, create an API key, and fetch data:

```bash
# Register
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "SecurePass123"}'

# Login (get tokens)
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}'

# Create API key (use accessToken from login)
curl -X POST http://localhost:3000/api/v1/auth/apikeys \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label": "My Key"}'

# Fetch characters (use API key)
curl "http://localhost:3000/v1/characters?limit=5" \
  -H "X-API-Key: YOUR_API_KEY"
```

### JavaScript Example
```javascript
// Fetch character details
fetch("http://localhost:3000/v1/characters/diluc", {
  headers: { "X-API-Key": "YOUR_API_KEY" }
})
  .then(res => res.json())
  .then(data => console.log(data.data));

// Fetch artifacts with filters
fetch("http://localhost:3000/v1/artifacts?region=Mondstadt&rarity=5", {
  headers: { "X-API-Key": "YOUR_API_KEY" }
})
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### Response Format
All responses follow a consistent structure:
```json
{
  "success": true,
  "data": { /* payload */ },
  "pagination": { /* if applicable */ }
}
```
Errors include `"success": false` with a message and status code.

## API Endpoints Overview

### General
| Method | Route          | Description          | Auth |
|--------|----------------|----------------------|------|
| GET    | /health        | Service health check | No   |

### Authentication
| Method | Route                     | Description                      | Auth |
|--------|---------------------------|----------------------------------|------|
| POST   | /v1/auth/register     | Register user, returns tokens.   | No   |
| POST   | /v1/auth/login        | Sign in, returns tokens.         | No   |
| POST   | /v1/auth/refresh      | Rotate tokens.                   | No   |
| POST   | /v1/auth/logout       | Revoke refresh token.            | No   |
| PUT    | /v1/auth/change-password | Change password.              | Yes  |
| POST   | /v1/auth/apikeys      | Create API key.                  | Yes  |
| GET    | /v1/auth/apikeys      | List API keys.                   | Yes  |
| DELETE | /v1/auth/apikeys      | Revoke API key.                  | Yes  |

### Users
| Method | Route              | Description              | Auth |
|--------|--------------------|--------------------------|------|
| GET    | /v1/users/me   | Current user profile.    | Yes  |
| PUT    | /v1/users/me   | Update profile.          | Yes  |
| GET    | /v1/users      | List all users.          | Yes (admin) |
| GET    | /v1/users/:id  | User details by ID.      | Yes (admin) |

### Characters
| Method | Route                    | Description                          | Auth |
|--------|--------------------------|--------------------------------------|------|
| GET    | /v1/characters       | List with filters/pagination.        | No   |
| GET    | /v1/characters/:id   | Details by ID.                       | No   |
| POST   | /v1/characters       | Create character.                    | Yes (admin) |
| PUT    | /v1/characters/:id   | Update character.                    | Yes (admin) |
| DELETE | /v1/characters/:id   | Delete character.                    | Yes (admin) |

Supported query params: `name`, `rarity`, `region`, `element`, `weaponType`, `releaseDate`, `versionAdded`, `page`, `limit`, `sortBy`, `sortOrder`.

### Artifacts
| Method | Route                    | Description                          | Auth |
|--------|--------------------------|--------------------------------------|------|
| GET    | /v1/artifacts        | List with filters/pagination.        | No   |
| GET    | /v1/artifacts/:id    | Details by ID.                       | No   |
| POST   | /v1/artifacts        | Create artifact.                     | Yes (admin) |
| PUT    | /v1/artifacts/:id    | Update artifact.                     | Yes (admin) |
| DELETE | /v1/artifacts/:id    | Delete artifact.                     | Yes (admin) |

Supported query params: `name`, `rarity`, `region`, `releaseDate`, `versionAdded`, `page`, `limit`, `sortBy`, `sortOrder`.

For full documentation and examples, see the [official docs website](https://docs.teyvatapi.xyz/).

## Testing

Run the test suite to verify functionality:
```bash
npm test
```
Tests cover authentication, CRUD operations, validation, and security. Uses Jest and Supertest.

## Contributing

Contributions welcome! Fork the repo, create a branch, and submit a PR. Ensure tests pass and follow the existing code style. For major changes, open an issue first.

## License

Distributed under the MIT License — see [LICENSE.md](LICENSE.md).  
All Genshin Impact-related intellectual property belongs to HoYoverse / Cognosphere; this project is unaffiliated.