# PWA Deployment Guide

## Production Build and Deployment

### 1. Build the Production Version

On the server, navigate to the PWA directory and build:

```bash
cd /var/www/html/apmapp
git pull origin develop
npm install  # Only if dependencies changed
npm run build
```

This will create a `dist` folder with the production-ready files.

### 2. Configure Web Server (Nginx)

The domain `apapp.saashmagna.com` should point to the `dist` folder. Example Nginx configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name apapp.saashmagna.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name apapp.saashmagna.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    root /var/www/html/apmapp/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Environment Variables (Optional)

If you need to override the API URL for different environments, create a `.env.production` file:

```bash
VITE_API_URL=https://saashmagna.com/mobile-api
```

Then build with:
```bash
npm run build
```

### 4. Deployment Steps

1. **Pull latest code:**
   ```bash
   cd /var/www/html/apmapp
   git pull origin develop
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Build production version:**
   ```bash
   npm run build
   ```

4. **Verify build:**
   ```bash
   ls -la dist/
   ```

5. **Restart web server (if needed):**
   ```bash
   sudo systemctl reload nginx
   # or
   sudo service nginx reload
   ```

### 5. Verify Deployment

- Visit `https://apapp.saashmagna.com`
- Check browser console for errors
- Verify API calls are going to `https://saashmagna.com/mobile-api`

### Troubleshooting

- **404 errors on routes:** Ensure Nginx has the `try_files` directive for SPA routing
- **API errors:** Check that the API URL in `constants.ts` is correct
- **CORS errors:** Ensure the backend allows requests from `apapp.saashmagna.com`
- **Build fails:** Check Node.js version (should be 18+), clear `node_modules` and reinstall




