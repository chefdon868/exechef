# ExeChef.com Deployment Guide

This guide provides step-by-step instructions for deploying the COGs Analysis System to ExeChef.com using Heroku.

## Prerequisites

- Heroku account
- Namecheap account with access to ExeChef.com DNS settings
- Git installed on your local machine
- Heroku CLI installed on your local machine

## Step 1: Prepare the Application for Deployment

### Backend Preparation

1. Create a `.env` file in the backend directory with the following variables:
```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://exechef.com
EMAIL_VERIFICATION_REQUIRED=true
ADMIN_APPROVAL_REQUIRED=true
```

2. Create a `Procfile` in the backend directory:
```
web: node src/server.js
```

### Frontend Preparation

1. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=https://api.exechef.com
```

2. Create a `static.json` file in the frontend directory:
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}
```

## Step 2: Deploy Backend to Heroku

1. Login to Heroku:
```bash
heroku login
```

2. Create a new Heroku app for the backend:
```bash
heroku create exechef-cogs-api
```

3. Add PostgreSQL add-on:
```bash
heroku addons:create heroku-postgresql:hobby-dev --app exechef-cogs-api
```

4. Add SendGrid for email functionality:
```bash
heroku addons:create sendgrid:starter --app exechef-cogs-api
```

5. Configure environment variables:
```bash
heroku config:set NODE_ENV=production --app exechef-cogs-api
heroku config:set JWT_SECRET=your-secure-jwt-secret --app exechef-cogs-api
heroku config:set CORS_ORIGIN=https://exechef.com --app exechef-cogs-api
heroku config:set EMAIL_VERIFICATION_REQUIRED=true --app exechef-cogs-api
heroku config:set ADMIN_APPROVAL_REQUIRED=true --app exechef-cogs-api
```

6. Deploy the backend:
```bash
cd /path/to/cogs_web_app
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a exechef-cogs-api
git subtree push --prefix backend heroku main
```

7. Run database migrations:
```bash
heroku run npm run migrate --app exechef-cogs-api
```

## Step 3: Deploy Frontend to Heroku

1. Create a new Heroku app for the frontend:
```bash
heroku create exechef-cogs-frontend
```

2. Configure environment variables:
```bash
heroku config:set NODE_ENV=production --app exechef-cogs-frontend
heroku config:set REACT_APP_API_URL=https://api.exechef.com --app exechef-cogs-frontend
```

3. Deploy the frontend:
```bash
cd /path/to/cogs_web_app
heroku git:remote -a exechef-cogs-frontend
git subtree push --prefix frontend heroku main
```

## Step 4: Configure Custom Domains

### Backend Domain (api.exechef.com)

1. Add the custom domain to the backend app:
```bash
heroku domains:add api.exechef.com --app exechef-cogs-api
```

2. Get the DNS target:
```bash
heroku domains:info api.exechef.com --app exechef-cogs-api
```

3. Note the DNS target value (e.g., `exechef-cogs-api.herokuapp.com`)

### Frontend Domain (exechef.com)

1. Add the custom domain to the frontend app:
```bash
heroku domains:add exechef.com --app exechef-cogs-frontend
```

2. Get the DNS target:
```bash
heroku domains:info exechef.com --app exechef-cogs-frontend
```

3. Note the DNS target value (e.g., `exechef-cogs-frontend.herokuapp.com`)

## Step 5: Configure Namecheap DNS

1. Log in to your Namecheap account
2. Go to Domain List and click "Manage" next to ExeChef.com
3. Select the "Advanced DNS" tab
4. Add the following records:

### For the root domain (exechef.com):
- Type: CNAME Record
- Host: @
- Value: [frontend DNS target from Step 4]
- TTL: Automatic

### For the API subdomain (api.exechef.com):
- Type: CNAME Record
- Host: api
- Value: [backend DNS target from Step 4]
- TTL: Automatic

### For www subdomain (optional):
- Type: CNAME Record
- Host: www
- Value: [frontend DNS target from Step 4]
- TTL: Automatic

5. Save changes and wait for DNS propagation (can take up to 48 hours)

## Step 6: Enable SSL

1. SSL for backend:
```bash
heroku certs:auto:enable --app exechef-cogs-api
```

2. SSL for frontend:
```bash
heroku certs:auto:enable --app exechef-cogs-frontend
```

## Step 7: Create Admin User

1. Access the Heroku console:
```bash
heroku run bash --app exechef-cogs-api
```

2. Create an admin user:
```bash
node
> const bcrypt = require('bcrypt')
> const salt = bcrypt.genSaltSync(10)
> const hashedPassword = bcrypt.hashSync('your-admin-password', salt)
> console.log(hashedPassword)
> exit
```

3. Use the hashed password to create an admin user in the database:
```bash
node
> const { User } = require('./src/models')
> User.create({
    username: 'admin',
    email: 'your-email@example.com',
    password: 'hashed-password-from-step-2',
    role: 'admin',
    isVerified: true,
    isApproved: true
  })
> exit
```

## Step 8: Verify Deployment

1. Visit https://exechef.com in your browser
2. Log in with the admin credentials created in Step 7
3. Test the application functionality:
   - Import data
   - View dashboard
   - Create additional users

## Step 9: Set Up Monitoring and Maintenance

1. Add Papertrail for log management:
```bash
heroku addons:create papertrail:choklad --app exechef-cogs-api
heroku addons:create papertrail:choklad --app exechef-cogs-frontend
```

2. Set up database backups:
```bash
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/New_York' --app exechef-cogs-api
```

3. Set up Heroku auto-scaling (optional):
```bash
heroku dyno:type hobby --app exechef-cogs-api
heroku dyno:type hobby --app exechef-cogs-frontend
```

## Troubleshooting

### DNS Issues
- Verify DNS records are correctly set up in Namecheap
- Use `dig exechef.com` and `dig api.exechef.com` to check DNS resolution
- DNS changes can take up to 48 hours to propagate

### Application Errors
- Check application logs:
  ```bash
  heroku logs --tail --app exechef-cogs-api
  heroku logs --tail --app exechef-cogs-frontend
  ```

### Database Issues
- Connect to the database:
  ```bash
  heroku pg:psql --app exechef-cogs-api
  ```
- Run migrations manually:
  ```bash
  heroku run npm run migrate --app exechef-cogs-api
  ```

## Maintenance

### Updating the Application

1. Make changes to your local codebase
2. Commit changes:
   ```bash
   git add .
   git commit -m "Update description"
   ```
3. Deploy backend changes:
   ```bash
   git subtree push --prefix backend heroku main
   ```
4. Deploy frontend changes:
   ```bash
   git subtree push --prefix frontend heroku main
   ```

### Database Backups

1. Create a manual backup:
   ```bash
   heroku pg:backups:capture --app exechef-cogs-api
   ```
2. Download a backup:
   ```bash
   heroku pg:backups:download --app exechef-cogs-api
   ```

## Security Recommendations

1. Regularly update dependencies:
   ```bash
   npm audit fix --force
   ```
2. Rotate JWT secret periodically:
   ```bash
   heroku config:set JWT_SECRET=new-secure-jwt-secret --app exechef-cogs-api
   ```
3. Monitor application logs for suspicious activity
4. Enable two-factor authentication for your Heroku account
5. Limit admin access to trusted team members only
