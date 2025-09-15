# 🐳 SuburbMates Docker Setup

This guide explains how to run SuburbMates using Docker for both development and production environments.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Git

## 🚀 Quick Start

### Option 1: Using the Setup Script (Recommended)

```bash
# Make the script executable (if not already)
chmod +x docker-setup.sh

# Run the interactive setup
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd suburbmates
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Start production environment:**
   ```bash
   docker-compose up -d
   ```

## 🏗️ Architecture Overview

### Development Environment
- **Next.js App** (port 3000) - Hot reloading enabled
- **PostgreSQL** (port 5433) - Development database
- **Redis** (port 6380) - Caching and sessions
- **Prisma Studio** (port 5555) - Database management UI
- **MailHog** (port 8025) - Email testing

### Production Environment
- **Next.js App** (port 3000) - Optimized build
- **PostgreSQL** (port 5432) - Production database
- **Redis** (port 6379) - Caching and sessions
- **Nginx** (ports 80/443) - Reverse proxy with SSL

## 📁 Docker Files Overview

| File | Purpose |
|------|----------|
| `Dockerfile` | Production build with multi-stage optimization |
| `Dockerfile.dev` | Development build with hot reloading |
| `docker-compose.yml` | Production services configuration |
| `docker-compose.dev.yml` | Development services configuration |
| `nginx.conf` | Nginx reverse proxy configuration |
| `.dockerignore` | Files to exclude from Docker build |
| `docker-setup.sh` | Interactive setup script |

## 🛠️ Development Workflow

### Starting Development Environment

```bash
# Start all development services
docker-compose -f docker-compose.dev.yml up -d

# Start with additional tools (Prisma Studio, MailHog)
docker-compose -f docker-compose.dev.yml --profile tools up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Development URLs
- **Application:** http://localhost:3000
- **Database:** localhost:5433 (postgres/suburbmates_user/suburbmates_password)
- **Redis:** localhost:6380
- **Prisma Studio:** http://localhost:5555 (with tools profile)
- **MailHog:** http://localhost:8025 (with tools profile)

### Hot Reloading
The development setup includes:
- ✅ Next.js hot reloading
- ✅ Volume mounting for source code
- ✅ Automatic dependency installation
- ✅ TypeScript compilation

## 🏭 Production Deployment

### Building for Production

```bash
# Build production images
docker-compose build

# Start production environment
docker-compose up -d

# Start with Nginx (full production stack)
docker-compose --profile production up -d
```

### Production Features
- ✅ Multi-stage Docker build for smaller images
- ✅ Nginx reverse proxy with SSL termination
- ✅ Gzip compression and caching
- ✅ Rate limiting and security headers
- ✅ Health checks and monitoring
- ✅ Optimized Next.js standalone output

### SSL Configuration

For production with SSL:

1. **Place SSL certificates:**
   ```bash
   mkdir -p ssl
   # Copy your SSL certificate files:
   # ssl/cert.pem
   # ssl/key.pem
   ```

2. **Update nginx.conf** with your domain name

3. **Start with production profile:**
   ```bash
   docker-compose --profile production up -d
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://suburbmates_user:suburbmates_password@postgres:5432/suburbmates
POSTGRES_DB=suburbmates
POSTGRES_USER=suburbmates_user
POSTGRES_PASSWORD=suburbmates_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Email
RESEND_API_KEY=your_resend_key
```

### Development vs Production

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | development | production |
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000 | https://yourdomain.com |
| Database Port | 5433 | 5432 |
| Redis Port | 6380 | 6379 |

## 📊 Monitoring and Debugging

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Development environment
docker-compose -f docker-compose.dev.yml logs -f
```

### Container Management

```bash
# List running containers
docker ps

# Execute commands in container
docker-compose exec app bash
docker-compose exec postgres psql -U suburbmates_user -d suburbmates

# Restart specific service
docker-compose restart app
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Generate Prisma client
docker-compose exec app npx prisma generate

# Seed database
docker-compose exec app npx prisma db seed

# Access database directly
docker-compose exec postgres psql -U suburbmates_user -d suburbmates
```

## 🧹 Maintenance

### Cleaning Up

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Clean up unused Docker resources
docker system prune -f

# Remove all SuburbMates containers and images
docker-compose down --rmi all -v
```

### Rebuilding

```bash
# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up --build -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill process using port
   kill -9 $(lsof -t -i:3000)
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

4. **Build failures:**
   ```bash
   # Clear Docker cache
   docker builder prune -f
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

### Performance Optimization

1. **Enable BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

2. **Use .dockerignore:**
   - Exclude `node_modules`, `.git`, etc.
   - Reduces build context size

3. **Multi-stage builds:**
   - Separate dependencies and build stages
   - Smaller final images

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

## 🤝 Contributing

When contributing Docker-related changes:

1. Test both development and production builds
2. Update this README if adding new services
3. Ensure .dockerignore is up to date
4. Test the setup script with your changes

---

**Happy Dockerizing! 🐳**