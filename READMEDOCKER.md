# Docker Setup Guide

This guide will help you set up and run the BikesOnline application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bikesonline
```

### 2. Create Environment Files

Create `.env` files in the following app folders with the necessary environment variables:

- `apps/backend/.env`
- `apps/admin-panel/.env`
- `apps/vendor-panel/.env`
- `apps/storefront/.env.local`

> **Note**: Make sure to configure the appropriate environment variables for each application. Refer to the `.env.example` files if available.

### 3. Build and Start Services

Run the following command from the root directory:

```bash
docker-compose up --build
```

This will:
- Build all Docker images
- Start PostgreSQL database
- Start Redis
- Start the backend service
- Start the admin panel, vendor panel, and storefront

Wait for all services to be healthy and running.

### 4. Get the Publishable API Key

> **Note**: The application can work with the hardcoded publishable key in `docker-compose.yml`, but it's highly recommended to change it for security purposes.

1. Open your browser and navigate to: http://localhost:8000
2. Login to the admin panel with:
   - **Email**: `admin@mercurjs.com`
   - **Password**: `supersecret`
3. Go to Settings and either:
   - Copy the existing publishable API key, **OR**
   - Create a new publishable API key

### 5. Configure the Storefront

1. Open `docker-compose.yml` in your editor
2. Find the `storefront` service configuration
3. Update the `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` environment variable with the key from step 4:

```yaml
storefront:
  environment:
    - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
```

### 6. Restart the Storefront

Rebuild and restart only the storefront service:

```bash
docker-compose up -d --build storefront
```

### 7. Secure Your Admin Account

For security purposes, it's important to change the default admin credentials:

1. Log back into the admin panel at http://localhost:8000
2. Go to Settings → Team/Users
3. Either:
   - Change the password for the default `admin@mercurjs.com` account, **OR**
   - Create a new admin account with your own credentials and delete the default one

### 8. Access the Application

Once all services are running, you can access:

- **Storefront**: http://localhost:3000
- **Admin Panel**: http://localhost:8000
- **Vendor Panel**: http://localhost:7000
- **Backend API**: http://localhost:9000

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database from your local machine (e.g., using VS Code extensions):

- The Docker container uses the hostname `postgres-bikesonline` internally
- From your local machine, connect using `localhost:5432`
- Use credentials: `bikesonline` / `bo123` / database: `bikesonline`

### Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop services and remove volumes (WARNING: This will delete all data):

```bash
docker-compose down -v
```

## Additional Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Restart a Specific Service

```bash
docker-compose restart <service-name>
```

### Rebuild Without Cache

```bash
docker-compose build --no-cache
docker-compose up
```
