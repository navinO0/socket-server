# QR Login Service with User Management Microservice

A Fastify-based backend service providing user authentication and whiteboard collaboration features.

## Architecture

This service uses a **microservice architecture** with the user authentication logic separated into a reusable submodule:
- **user-management** - Standalone authentication microservice (git submodule)
- **whiteboard** - Real-time collaborative whiteboard with Socket.io

## Features

### Authentication (via user-management submodule)
- ✅ User registration with encrypted data
- ✅ Login with username/password
- ✅ QR code authentication
- ✅ Google OAuth integration
- ✅ Device management (max 3 devices per user)
- ✅ JWT token-based authentication
- ✅ Redis session management

### Whiteboard
- ✅ Real-time drawing synchronization
- ✅ Room-based collaboration
- ✅ Canvas state persistence in Redis

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Redis server

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd qr_login_service

# Initialize submodules
git submodule update --init --recursive

# Install dependencies
npm install

# Install submodule dependencies
cd user-management
npm install
cd ..
```

## Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
SOCKET_PORT=3001
HOST=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY_HEX=your_encryption_key_hex_here
```

Also configure the user-management submodule:

```bash
cd user-management
cp .env.example .env
# Edit .env with your configuration
```

## Database Setup

Run the migration to create the users table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running the Service

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on:
- API: `http://localhost:3000`
- Socket.io: `http://localhost:3001`

## API Endpoints

### User Management (Submodule)

All user authentication endpoints are prefixed with `/user`:

- `POST /user/public/create` - Register new user
- `POST /user/public/login` - Login
- `POST /user/public/register` - Google OAuth registration
- `POST /user/get/code` - Generate QR code (requires auth)
- `POST /user/login/code/:code` - Login with QR code
- `GET /user/get/image` - Get profile image (requires auth)
- `GET /user/get/devices` - List user devices (requires auth)
- `POST /user/delete/devices` - Remove devices (requires auth)

### Whiteboard

Socket.io events:
- `join-room` - Join a whiteboard room
- `draw` - Synchronize drawing data
- `clear` - Clear the whiteboard

## Project Structure

```
qr_login_service/
├── user-management/          # Git submodule - User authentication
├── core/                      # Core utilities
│   ├── config/               # Configuration
│   ├── logger/               # Logging
│   ├── redis_config/         # Redis client
│   └── token_generate_validate/ # Token validation
├── whiteboard/               # Whiteboard functionality
│   ├── socket.js            # Socket.io handlers
│   └── scheduler.js         # Cleanup tasks
├── qr_link/                  # Main routes
│   └── routes.js            # Route registration
├── server.js                 # Server setup
└── main.js                   # Entry point
```

## Updating the User Management Submodule

When the user-management microservice is updated:

```bash
# Pull latest changes
cd user-management
git pull origin main
cd ..

# Commit the submodule update
git add user-management
git commit -m "Updated user-management submodule"
```

## Development

### Adding New Features

- **Authentication features**: Modify the `user-management` submodule
- **Whiteboard features**: Modify files in the `whiteboard` directory

### Testing

```bash
# Test user registration
curl -X POST http://localhost:3000/user/public/create \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123",...}'

# Test login
curl -X POST http://localhost:3000/user/public/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123",...}'
```

## Deployment

1. Set environment variables on your server
2. Install dependencies including submodules
3. Run database migrations
4. Start the service with `npm start`

## License

MIT
