#!/bin/sh

# SuburbMates Docker Entrypoint Script
# Handles runtime environment variable replacement for NEXT_PUBLIC_ variables
# Based on Next.js Docker best practices for 2024/2025

set -e

echo "🚀 Starting SuburbMates Docker container..."
echo "📝 Processing environment variables..."

# Function to replace environment variables in built files
replace_env_vars() {
    echo "🔄 Replacing NEXT_PUBLIC_ environment variables at runtime..."
    
    # Replace Supabase URL
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo "   Replacing Supabase URL placeholder"
        find /app/.next -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|https://placeholder\.supabase\.co|$NEXT_PUBLIC_SUPABASE_URL|g" {} \;
        if [ -d "/app/.next/static" ]; then
            find /app/.next/static -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|https://placeholder\.supabase\.co|$NEXT_PUBLIC_SUPABASE_URL|g" {} \;
        fi
    fi
    
    # Replace Supabase Anon Key
    if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "   Replacing Supabase Anon Key placeholder"
        find /app/.next -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0\.placeholder|$NEXT_PUBLIC_SUPABASE_ANON_KEY|g" {} \;
        if [ -d "/app/.next/static" ]; then
            find /app/.next/static -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0\.placeholder|$NEXT_PUBLIC_SUPABASE_ANON_KEY|g" {} \;
        fi
    fi
    
    # Replace GA4 Measurement ID
    if [ -n "$NEXT_PUBLIC_GA4_MEASUREMENT_ID" ]; then
        echo "   Replacing GA4 Measurement ID placeholder"
        find /app/.next -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|G-PLACEHOLDER|$NEXT_PUBLIC_GA4_MEASUREMENT_ID|g" {} \;
        if [ -d "/app/.next/static" ]; then
            find /app/.next/static -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|G-PLACEHOLDER|$NEXT_PUBLIC_GA4_MEASUREMENT_ID|g" {} \;
        fi
    fi
    
    # Replace Sentry DSN
    if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
        echo "   Replacing Sentry DSN placeholder"
        find /app/.next -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|https://placeholder@sentry\.io/placeholder|$NEXT_PUBLIC_SENTRY_DSN|g" {} \;
        if [ -d "/app/.next/static" ]; then
            find /app/.next/static -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|https://placeholder@sentry\.io/placeholder|$NEXT_PUBLIC_SENTRY_DSN|g" {} \;
        fi
    fi
    
    # Handle NEXT_PUBLIC_APP_URL separately as it might be set to localhost during build
    if [ -n "$NEXT_PUBLIC_APP_URL" ] && [ "$NEXT_PUBLIC_APP_URL" != "http://localhost:3000" ]; then
        echo "   Replacing localhost URL with $NEXT_PUBLIC_APP_URL"
        find /app/.next -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|http://localhost:3000|$NEXT_PUBLIC_APP_URL|g" {} \;
        if [ -d "/app/.next/static" ]; then
            find /app/.next/static -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i "s|http://localhost:3000|$NEXT_PUBLIC_APP_URL|g" {} \;
        fi
    fi
    
    echo "✅ Environment variable replacement completed"
}

# Function to validate required environment variables
validate_env_vars() {
    echo "🔍 Validating required environment variables..."
    
    # List of required environment variables
    REQUIRED_VARS="
        NEXT_PUBLIC_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY
        DATABASE_URL
        RESEND_API_KEY
    "
    
    missing_vars=""
    
    for var in $REQUIRED_VARS; do
        if [ -z "$(eval echo \$$var)" ]; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        echo "❌ Missing required environment variables:$missing_vars"
        echo "💡 Please check your .env file or Docker environment configuration"
        exit 1
    fi
    
    echo "✅ All required environment variables are present"
}

# Function to set up database connection
setup_database() {
    echo "🗄️  Setting up database connection..."
    
    # If using Docker PostgreSQL, wait for it to be ready
    if [ "$NODE_ENV" = "development" ] && [ -n "$DOCKER_DATABASE_URL" ]; then
        echo "⏳ Waiting for PostgreSQL to be ready..."
        
        # Extract host and port from DATABASE_URL
        DB_HOST=$(echo $DOCKER_DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DOCKER_DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        # Wait for database to be ready (max 30 seconds)
        timeout=30
        while [ $timeout -gt 0 ]; do
            if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                echo "✅ Database is ready"
                break
            fi
            echo "   Waiting for database... ($timeout seconds remaining)"
            sleep 1
            timeout=$((timeout - 1))
        done
        
        if [ $timeout -eq 0 ]; then
            echo "❌ Database connection timeout"
            exit 1
        fi
    fi
}

# Function to run database migrations if needed
run_migrations() {
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        echo "🔄 Running database migrations..."
        npm run db:migrate || {
            echo "❌ Database migration failed"
            exit 1
        }
        echo "✅ Database migrations completed"
    fi
}

# Function to generate Prisma client if needed
generate_prisma_client() {
    if [ "$GENERATE_PRISMA_CLIENT" = "true" ]; then
        echo "🔄 Generating Prisma client..."
        npx prisma generate || {
            echo "❌ Prisma client generation failed"
            exit 1
        }
        echo "✅ Prisma client generated"
    fi
}

# Function to display startup information
display_startup_info() {
    echo ""
    echo "🎉 SuburbMates is starting up!"
    echo "📍 Environment: ${NODE_ENV:-development}"
    echo "🌐 App URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
    echo "🗄️  Database: $(echo $DATABASE_URL | sed 's/:[^@]*@/@***:***@/')"
    echo "📧 Email Service: ${SENDER_DOMAIN:-mail.suburbmates.com.au}"
    echo "🔧 Port: ${PORT:-3000}"
    echo ""
}

# Main execution flow
main() {
    # Validate environment variables
    validate_env_vars
    
    # Set up database connection
    setup_database
    
    # Replace environment variables in built files
    replace_env_vars
    
    # Run migrations if requested
    run_migrations
    
    # Generate Prisma client if requested
    generate_prisma_client
    
    # Display startup information
    display_startup_info
    
    # Execute the main command
    echo "🚀 Starting application with command: $@"
    exec "$@"
}

# Handle signals gracefully
trap 'echo "🛑 Received shutdown signal, stopping gracefully..."; exit 0' TERM INT

# Run main function with all arguments
main "$@"