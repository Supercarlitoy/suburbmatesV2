#!/bin/bash

# SuburbMates Docker Setup Script
# This script helps set up the Docker development environment

set -e

echo "🐳 SuburbMates Docker Setup"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_success ".env file created. Please update it with your actual values."
else
    print_success ".env file exists"
fi

# Function to show menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) 🚀 Start development environment (with hot reload)"
    echo "2) 🏭 Start production environment"
    echo "3) 🛠️  Start with additional tools (Prisma Studio, MailHog)"
    echo "4) 🧹 Clean up (stop and remove containers)"
    echo "5) 📊 View logs"
    echo "6) 🔄 Rebuild containers"
    echo "7) 📋 Show running containers"
    echo "8) ❌ Exit"
    echo ""
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development environment started!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  Database: localhost:5433 (postgres)"
    echo "🔴 Redis: localhost:6380"
    echo ""
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose up -d
    print_success "Production environment started!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  Database: localhost:5432 (postgres)"
    echo "🔴 Redis: localhost:6379"
    echo ""
}

# Function to start with tools
start_with_tools() {
    print_status "Starting development environment with tools..."
    docker-compose -f docker-compose.dev.yml --profile tools up -d
    print_success "Development environment with tools started!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  Database: localhost:5433 (postgres)"
    echo "🔴 Redis: localhost:6380"
    echo "📊 Prisma Studio: http://localhost:5555"
    echo "📧 MailHog: http://localhost:8025"
    echo ""
}

# Function to clean up
cleanup() {
    print_status "Cleaning up containers and volumes..."
    docker-compose -f docker-compose.dev.yml down -v
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to view logs
view_logs() {
    echo "Choose which logs to view:"
    echo "1) Development logs"
    echo "2) Production logs"
    read -p "Enter choice [1-2]: " log_choice
    
    case $log_choice in
        1)
            docker-compose -f docker-compose.dev.yml logs -f
            ;;
        2)
            docker-compose logs -f
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Function to rebuild containers
rebuild() {
    print_status "Rebuilding containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose build --no-cache
    print_success "Containers rebuilt!"
}

# Function to show running containers
show_containers() {
    print_status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice [1-8]: " choice
    
    case $choice in
        1)
            start_dev
            ;;
        2)
            start_prod
            ;;
        3)
            start_with_tools
            ;;
        4)
            cleanup
            ;;
        5)
            view_logs
            ;;
        6)
            rebuild
            ;;
        7)
            show_containers
            ;;
        8)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done