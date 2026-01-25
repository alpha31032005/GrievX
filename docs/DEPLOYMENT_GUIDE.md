# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Smart Civic Issue Reporting and Analytics System. The application consists of three main components that need to be deployed:

1. **Backend Service** (Node.js/Express)
2. **ML Service** (Python/FastAPI)
3. **Frontend** (React/Vite)

## Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Hardware Requirements

- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended for production)
- **Storage**: 20GB free space
- **Network**: Stable internet connection

### Software Requirements

- **Operating System**: Windows 10/11, Linux (Ubuntu 20.04+), or macOS
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.9 or higher
- **MongoDB**: Version 5.0 or higher
- **Git**: Latest version

## Prerequisites

Before starting the deployment, ensure you have the following installed:

### 1. Node.js and npm

Download and install from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### 2. Python

Download and install from [python.org](https://python.org/)

Verify installation:
```bash
python --version
pip --version
```

### 3. MongoDB

**Option A: Local Installation**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Follow the installation wizard
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster
- Get your connection string

### 4. Git

Download and install from [git-scm.com](https://git-scm.com/)

Verify installation:
```bash
git --version
```

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd smart-civic-system
```

### Step 2: Setup Backend Service

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart_civic_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Admin Credentials
CHIEF_EMAIL=chief@civic.com
CHIEF_PASSWORD=chief123

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

The backend should now be running on `http://localhost:5000`

### Step 3: Setup ML Service

Navigate to the ml-service directory:
```bash
cd ../ml-service
```

Create a Python virtual environment:

**Windows:**
```bash
python -m venv mlenv
mlenv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv mlenv
source mlenv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the ml-service directory:
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=1

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173

# Model Configuration
MODEL_PATH=app/models
TEXT_MODEL_NAME=text_classifier.pkl
IMAGE_MODEL_NAME=image_classifier.keras
LABEL_ENCODER_NAME=label_encoder.pkl
```

Start the ML service:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The ML service should now be running on `http://localhost:8000`

### Step 4: Setup Frontend

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

### Step 5: Verify Installation

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Smart Civic System homepage
3. Test the health endpoints:
   - Backend: `http://localhost:5000/health`
   - ML Service: `http://localhost:8000/health`

## Production Deployment

### Deployment Options

1. **Traditional VPS/Server** (DigitalOcean, AWS EC2, Azure VM)
2. **Platform as a Service** (Heroku, Render, Railway)
3. **Container-based** (Docker, Kubernetes)

### Option 1: Traditional Server Deployment

#### 1. Server Setup

Update system packages:
```bash
sudo apt update
sudo apt upgrade -y
```

Install required software:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Deploy Backend

Clone and setup:
```bash
cd /var/www
sudo git clone <repository-url> smart-civic-system
cd smart-civic-system/backend
sudo npm install --production
```

Create production environment file:
```bash
sudo nano .env
```

Add production configuration (see Environment Configuration section)

Start with PM2:
```bash
sudo pm2 start server.js --name smart-civic-backend
sudo pm2 save
sudo pm2 startup
```

#### 3. Deploy ML Service

Setup ML service:
```bash
cd /var/www/smart-civic-system/ml-service
sudo python3 -m venv mlenv
source mlenv/bin/activate
sudo pip install -r requirements.txt
```

Start with PM2:
```bash
sudo pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4" --name smart-civic-ml
sudo pm2 save
```

#### 4. Deploy Frontend

Build the frontend:
```bash
cd /var/www/smart-civic-system/frontend
sudo npm install
sudo npm run build
```

The build files will be in the `dist` directory.

#### 5. Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/smart-civic
```

Add the following configuration:
```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/smart-civic-system/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # ML Service
    location /ml {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/smart-civic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL Certificate (Optional but Recommended)

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete SSL setup.

### Option 2: Docker Deployment

#### 1. Create Docker Files

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**ML Service Dockerfile** (`ml-service/Dockerfile`):
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create Docker Compose File

**docker-compose.yml** (in root directory):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: smart-civic-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_password_here

  backend:
    build: ./backend
    container_name: smart-civic-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:your_password_here@mongodb:27017/smart_civic_system?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - mongodb
      - ml-service

  ml-service:
    build: ./ml-service
    container_name: smart-civic-ml
    ports:
      - "8000:8000"
    volumes:
      - ./ml-service/app/models:/app/app/models

  frontend:
    build: ./frontend
    container_name: smart-civic-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 3. Deploy with Docker Compose

Build and start all services:
```bash
docker-compose up -d --build
```

View logs:
```bash
docker-compose logs -f
```

Stop all services:
```bash
docker-compose down
```

## Environment Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://username:password@host:port/database

# Security
JWT_SECRET=use_a_strong_random_secret_key_here
JWT_EXPIRY=7d

# Services
ML_SERVICE_URL=http://ml-service:8000

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Admin Credentials (Change these!)
CHIEF_EMAIL=chief@civic.com
CHIEF_PASSWORD=secure_password_here

# Admin Accounts
# Format: email:password:department
ADMIN_GARBAGE=garbage.admin@civic.com:password:garbage
ADMIN_POTHOLES=potholes.admin@civic.com:password:potholes
ADMIN_ELECTRIC=electric.admin@civic.com:password:electric_poles
ADMIN_TREES=trees.admin@civic.com:password:fallen_trees
```

### ML Service Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Environment
ENVIRONMENT=production
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=https://your-domain.com,http://backend:5000

# Models
MODEL_PATH=app/models
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-domain.com/api
VITE_ML_SERVICE_URL=https://your-domain.com/ml
```

## Database Setup

### Initialize Database

The application will automatically create the necessary collections on first run. However, you may want to create indexes for better performance:

Connect to MongoDB:
```bash
mongosh
```

Create indexes:
```javascript
use smart_civic_system

// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Complaint indexes
db.complaints.createIndex({ userId: 1 })
db.complaints.createIndex({ status: 1 })
db.complaints.createIndex({ category: 1 })
db.complaints.createIndex({ department: 1 })
db.complaints.createIndex({ ward: 1 })
db.complaints.createIndex({ createdAt: -1 })
db.complaints.createIndex({ location: "2dsphere" })
```

### Database Backup

Create regular backups:
```bash
# Backup
mongodump --uri="mongodb://username:password@host:port/smart_civic_system" --out=/backup/path

# Restore
mongorestore --uri="mongodb://username:password@host:port/smart_civic_system" /backup/path
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, random JWT secrets
- Change default admin passwords immediately
- Use environment-specific configurations

### 2. Database Security

- Enable MongoDB authentication
- Use strong database passwords
- Restrict database access to specific IP addresses
- Enable SSL/TLS for database connections

### 3. API Security

- Implement rate limiting to prevent abuse
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper CORS policies
- Keep dependencies updated

### 4. Server Security

- Keep the operating system updated
- Use a firewall to restrict access
- Disable unnecessary services
- Regular security audits
- Monitor logs for suspicious activity

### 5. SSL/TLS Configuration

Always use HTTPS in production. Use Let's Encrypt for free SSL certificates:

```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Maintenance

### 1. Process Monitoring with PM2

View running processes:
```bash
pm2 list
```

View logs:
```bash
pm2 logs smart-civic-backend
pm2 logs smart-civic-ml
```

Monitor resources:
```bash
pm2 monit
```

Restart services:
```bash
pm2 restart smart-civic-backend
pm2 restart smart-civic-ml
```

### 2. Log Management

Backend logs are stored in:
- Development: Console output
- Production: `backend/logs/` directory

Set up log rotation:
```bash
sudo nano /etc/logrotate.d/smart-civic
```

Add:
```
/var/www/smart-civic-system/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### 3. Database Maintenance

Regular maintenance tasks:
```bash
# Compact database
mongosh --eval "db.runCommand({ compact: 'complaints' })"
mongosh --eval "db.runCommand({ compact: 'users' })"

# Check database stats
mongosh --eval "db.stats()"

# Repair database if needed
mongod --repair
```

### 4. Performance Monitoring

Consider implementing:
- Application Performance Monitoring (APM) tools
- Server monitoring (CPU, RAM, disk usage)
- Database query performance analysis
- API response time tracking

### 5. Update Strategy

Regular updates:
```bash
# Pull latest code
cd /var/www/smart-civic-system
git pull

# Update backend
cd backend
npm install
pm2 restart smart-civic-backend

# Update ML service
cd ../ml-service
source mlenv/bin/activate
pip install -r requirements.txt
pm2 restart smart-civic-ml

# Update frontend
cd ../frontend
npm install
npm run build
```

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
```bash
# Check logs
pm2 logs smart-civic-backend

# Check if port is in use
sudo lsof -i :5000

# Verify environment variables
cd backend
cat .env

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

**Problem**: Database connection error
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Ensure MongoDB authentication is configured correctly

### ML Service Issues

**Problem**: ML service crashes or won't start
```bash
# Check logs
pm2 logs smart-civic-ml

# Verify Python environment
source mlenv/bin/activate
python --version

# Check if models are present
ls -la app/models/

# Test ML service manually
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Problem**: Model files missing
- Ensure model files are in `ml-service/app/models/`
- Check file permissions
- Re-train models if necessary using the provided notebooks

### Frontend Issues

**Problem**: Frontend not loading
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Problem**: API calls failing
- Check if backend is running
- Verify API URL in frontend `.env`
- Check CORS configuration in backend
- Inspect browser console for errors

### Database Issues

**Problem**: MongoDB not starting
```bash
# Check service status
sudo systemctl status mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log

# Check disk space
df -h

# Restart service
sudo systemctl restart mongod
```

### Network Issues

**Problem**: Services can't communicate
```bash
# Check if ports are open
sudo netstat -tulpn | grep LISTEN

# Test connectivity
curl http://localhost:5000/health
curl http://localhost:8000/health

# Check firewall rules
sudo ufw status
```

### Permission Issues

**Problem**: Permission denied errors
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/smart-civic-system

# Fix permissions
sudo chmod -R 755 /var/www/smart-civic-system
```

## Health Checks

Set up regular health checks:

**Backend**: `GET http://localhost:5000/health`
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T10:30:00.000Z"
}
```

**ML Service**: `GET http://localhost:8000/health`
```json
{
  "status": "healthy",
  "models": {
    "text_classifier": "loaded",
    "image_classifier": "loaded"
  }
}
```

## Support

For deployment issues or questions:
1. Check the logs for error messages
2. Review this guide carefully
3. Consult the API documentation
4. Contact the development team

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Note**: This deployment guide assumes a basic understanding of server administration. For production deployments, consider consulting with a DevOps professional to ensure proper security and optimization.