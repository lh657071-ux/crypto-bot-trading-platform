# Authentication Implementation

## Overview
Complete JWT-based authentication with:
- User registration & login
- Password hashing (bcrypt)
- Access & Refresh tokens
- Protected routes
- Password strength validation
- Token revocation

## Features

### AuthService
- `hashPassword()` - Bcrypt password hashing
- `comparePassword()` - Verify password against hash
- `generateToken()` - Create JWT access token (7 days)
- `verifyToken()` - Validate JWT token
- `generateRefreshToken()` - Create refresh token (30 days)
- `verifyRefreshToken()` - Validate refresh token
- `validatePasswordStrength()` - Check password requirements:
  - At least 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number
  - 1 special character (!@#$%^&*)

### Authentication Endpoints

**POST /api/auth/register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "SecurePass123!",
    "fullName": "John Doe"
  }'
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**POST /api/auth/refresh**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your_refresh_token"}'
```

**POST /api/auth/logout**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer your_access_token"
```

**GET /api/auth/me**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_access_token"
```

**POST /api/auth/change-password**
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

### Middleware

**authMiddleware** (Required)
- Validates JWT token in Authorization header
- Sets `req.userId` and `req.userEmail`
- Returns 401 if token is invalid/missing

**optionalAuthMiddleware**
- Sets `req.userId` if token is present
- Continues if token is missing or invalid

### Usage in Routes

```typescript
import { authMiddleware } from './middleware/auth.middleware';

router.get('/protected-route', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  // Protected logic here
});
```

### Environment Variables

```bash
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_bot
```

### Database Tables

**users** - Core user data with password hash
**refresh_tokens** - Store refresh tokens for revocation
**password_reset_tokens** - For password recovery flow

### Response Format

**Success (Login)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "fullName": "John Doe"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

**Error**
```json
{
  "error": "Invalid email or password"
}
```
