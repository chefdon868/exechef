# Heroku Deployment Configuration for ExeChef COGs Analysis System

This document outlines the configuration for deploying the ExeChef COGs Analysis System to Heroku and connecting it to the ExeChef.com domain.

## 1. Heroku Setup

### Backend Configuration

```json
{
  "name": "exechef-cogs-api",
  "description": "ExeChef COGs Analysis System API",
  "stack": "heroku-22",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "addons": [
    {
      "plan": "heroku-postgresql:hobby-dev"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": "generate-a-secure-random-string",
    "CORS_ORIGIN": "https://exechef.com",
    "EMAIL_VERIFICATION_REQUIRED": "true",
    "ADMIN_APPROVAL_REQUIRED": "true"
  }
}
```

### Frontend Configuration

```json
{
  "name": "exechef-cogs-frontend",
  "description": "ExeChef COGs Analysis System Frontend",
  "stack": "heroku-22",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "REACT_APP_API_URL": "https://api.exechef.com"
  }
}
```

## 2. Database Configuration

- PostgreSQL database will be automatically provisioned through Heroku add-ons
- Database migrations will be run automatically during deployment
- Daily backups will be configured

## 3. DNS Configuration (Namecheap)

### Root Domain (exechef.com)

- Type: ALIAS or ANAME
- Value: exechef-cogs-frontend.herokuapp.com

### API Subdomain (api.exechef.com)

- Type: CNAME
- Value: exechef-cogs-api.herokuapp.com

### Additional DNS Records

- Type: TXT
- Name: _heroku
- Value: [Heroku DNS verification value]

## 4. SSL Configuration

- Automatic SSL certificates will be provisioned through Heroku
- Force HTTPS will be enabled for all traffic

## 5. Email Authentication System

- SendGrid add-on will be used for email delivery
- Email verification flow:
  1. User registers with email and password
  2. Verification email is sent with unique token
  3. User clicks verification link
  4. Admin receives notification of new user
  5. Admin approves or rejects user
  6. User is notified of approval status

## 6. Deployment Pipeline

### Backend Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create exechef-cogs-api

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:hobby-dev

# Add SendGrid add-on for email
heroku addons:create sendgrid:starter

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set CORS_ORIGIN=https://exechef.com
heroku config:set EMAIL_VERIFICATION_REQUIRED=true
heroku config:set ADMIN_APPROVAL_REQUIRED=true

# Deploy backend
git subtree push --prefix backend heroku main

# Run database migrations
heroku run npx sequelize-cli db:migrate
```

### Frontend Deployment

```bash
# Create Heroku app for frontend
heroku create exechef-cogs-frontend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set REACT_APP_API_URL=https://api.exechef.com

# Deploy frontend
git subtree push --prefix frontend heroku main
```

## 7. Custom Domain Setup

```bash
# Add custom domain to backend app
heroku domains:add api.exechef.com -a exechef-cogs-api

# Add custom domain to frontend app
heroku domains:add exechef.com -a exechef-cogs-frontend

# Get DNS target for backend
heroku domains:info api.exechef.com -a exechef-cogs-api

# Get DNS target for frontend
heroku domains:info exechef.com -a exechef-cogs-frontend
```

## 8. Monitoring and Maintenance

- Heroku metrics dashboard will be used for monitoring
- Papertrail add-on will be added for log management
- Weekly database backups will be configured
- Monthly security updates will be scheduled
