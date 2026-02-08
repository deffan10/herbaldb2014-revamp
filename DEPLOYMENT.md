# HerbalDB Deployment Guide 🚀

## Server Specifications
- **OS**: Debian 13
- **Web Server**: Nginx
- **Domain**: herbaldb.site
- **Root Path**: /home/htdocs/herbaldb

---

## 📋 Prerequisites

### 1. Install Required Packages

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2 + Extensions untuk Laravel
sudo apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-curl \
    php8.2-mbstring php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl php8.2-readline

# Install Composer (jika belum ada)
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20 LTS (jika belum ada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally (jika belum ada)
sudo npm install -g pm2

# Install MariaDB (jika belum ada)
sudo apt install -y mariadb-server mariadb-client
```

### 2. Create Database

```bash
sudo mysql -u root

# Di MySQL shell:
CREATE DATABASE herbaldb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'herbaldb_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON herbaldb.* TO 'herbaldb_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📁 Project Structure di Server

```
/home/htdocs/herbaldb/
├── backend/          # Laravel API
├── frontend/         # Next.js (build output)
├── shared/           # Shared storage (uploads, mol files)
└── logs/             # Application logs
```

---

## 🔧 Backend Deployment (Laravel)

### 1. Clone & Setup

```bash
cd /home/htdocs
git clone https://github.com/annisaprida/herbaldb2014.git herbaldb
cd herbaldb/backend

# Install dependencies (tanpa dev)
composer install --no-dev --optimize-autoloader

# Copy environment file
cp .env.example .env
nano .env
```

### 2. Configure .env

```env
APP_NAME=HerbalDB
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.herbaldb.site

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=herbaldb
DB_USERNAME=herbaldb_user
DB_PASSWORD=YourSecurePassword123!

# Session & Sanctum untuk cross-domain
SESSION_DRIVER=cookie
SESSION_DOMAIN=.herbaldb.site
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=herbaldb.site,www.herbaldb.site

# Frontend URL untuk CORS
FRONTEND_URL=https://herbaldb.site

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### 3. Laravel Setup Commands

```bash
# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Import legacy data (jika fresh install)
php artisan herbaldb:import-legacy --fresh --force

# Link MOL files
php artisan db:seed --class=LinkMolFilesSeeder

# Storage link
php artisan storage:link

# Cache config untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /home/htdocs/herbaldb/backend
sudo chmod -R 755 /home/htdocs/herbaldb/backend
sudo chmod -R 775 /home/htdocs/herbaldb/backend/storage
sudo chmod -R 775 /home/htdocs/herbaldb/backend/bootstrap/cache
```

### 4. PHP-FPM Pool Configuration

```bash
sudo nano /etc/php/8.2/fpm/pool.d/herbaldb.conf
```

```ini
[herbaldb]
user = www-data
group = www-data
listen = /run/php/php8.2-fpm-herbaldb.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 20
pm.start_servers = 5
pm.min_spare_servers = 3
pm.max_spare_servers = 10
pm.max_requests = 500

php_admin_value[error_log] = /home/htdocs/herbaldb/logs/php-error.log
php_admin_flag[log_errors] = on
php_value[upload_max_filesize] = 20M
php_value[post_max_size] = 25M
php_value[max_execution_time] = 60
```

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## ⚛️ Frontend Deployment (Next.js)

### 1. Build Frontend

```bash
cd /home/htdocs/herbaldb/frontend

# Install dependencies
npm ci --only=production

# Create .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.herbaldb.site/api/v1
NEXT_PUBLIC_STORAGE_URL=https://api.herbaldb.site/storage
```

```bash
# Build for production
npm run build
```

### 2. Setup PM2

```bash
# Create ecosystem config
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'herbaldb-frontend',
    cwd: '/home/htdocs/herbaldb/frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: '/home/htdocs/herbaldb/logs/frontend-error.log',
    out_file: '/home/htdocs/herbaldb/logs/frontend-out.log',
    merge_logs: true,
    time: true
  }]
};
```

```bash
# Start dengan PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup startup script (agar auto-start saat reboot)
pm2 startup
# Jalankan command yang diberikan PM2
```

---

## 🌐 Nginx Configuration

### 1. Backend (API) - api.herbaldb.site

```bash
sudo nano /etc/nginx/sites-available/api.herbaldb.site
```

```nginx
server {
    listen 80;
    server_name api.herbaldb.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.herbaldb.site;

    # SSL akan ditambahkan oleh Certbot
    # ssl_certificate /etc/letsencrypt/live/api.herbaldb.site/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.herbaldb.site/privkey.pem;

    root /home/htdocs/herbaldb/backend/public;
    index index.php;

    # Logging
    access_log /home/htdocs/herbaldb/logs/api-access.log;
    error_log /home/htdocs/herbaldb/logs/api-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File size limit
    client_max_body_size 25M;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm-herbaldb.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Static files cache (MOL files, images)
    location ~* \.(mol|mol2|jpg|jpeg|png|gif|ico|webp|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Deny access to sensitive files
    location ~ /(artisan|composer\.(json|lock)|package\.json|webpack\.mix\.js)$ {
        deny all;
    }
}
```

### 2. Frontend - herbaldb.site & www.herbaldb.site

```bash
sudo nano /etc/nginx/sites-available/herbaldb.site
```

```nginx
server {
    listen 80;
    server_name herbaldb.site www.herbaldb.site;
    return 301 https://herbaldb.site$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.herbaldb.site;
    
    # SSL akan ditambahkan oleh Certbot
    
    return 301 https://herbaldb.site$request_uri;
}

server {
    listen 443 ssl http2;
    server_name herbaldb.site;

    # SSL akan ditambahkan oleh Certbot
    # ssl_certificate /etc/letsencrypt/live/herbaldb.site/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/herbaldb.site/privkey.pem;

    # Logging
    access_log /home/htdocs/herbaldb/logs/frontend-access.log;
    error_log /home/htdocs/herbaldb/logs/frontend-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Public static files
    location /favicon.ico {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
    }
}
```

### 3. Enable Sites & Test

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/api.herbaldb.site /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/herbaldb.site /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔐 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d herbaldb.site -d www.herbaldb.site
sudo certbot --nginx -d api.herbaldb.site

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔄 Deployment Script

Buat script untuk update di kemudian hari:

```bash
nano /home/htdocs/herbaldb/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting HerbalDB Deployment..."

cd /home/htdocs/herbaldb

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin develop

# Backend
echo "🔧 Deploying Backend..."
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
echo "⚛️ Deploying Frontend..."
cd ../frontend
npm ci --only=production
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart herbaldb-frontend
sudo systemctl reload php8.2-fpm

echo "✅ Deployment complete!"
```

```bash
chmod +x /home/htdocs/herbaldb/deploy.sh
```

---

## 📊 Monitoring Commands

```bash
# Check PM2 status
pm2 status
pm2 logs herbaldb-frontend

# Check PHP-FPM
sudo systemctl status php8.2-fpm

# Check Nginx
sudo systemctl status nginx
sudo tail -f /home/htdocs/herbaldb/logs/api-error.log

# Check Laravel logs
tail -f /home/htdocs/herbaldb/backend/storage/logs/laravel.log

# Database backup
mysqldump -u herbaldb_user -p herbaldb > backup_$(date +%Y%m%d).sql
```

---

## 🔥 Firewall (UFW)

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## ✅ Post-Deployment Checklist

- [ ] DNS A record: `herbaldb.site` → Server IP
- [ ] DNS A record: `www.herbaldb.site` → Server IP  
- [ ] DNS A record: `api.herbaldb.site` → Server IP
- [ ] SSL certificates installed & auto-renewal working
- [ ] Backend accessible: https://api.herbaldb.site/api/v1/stats
- [ ] Frontend accessible: https://herbaldb.site
- [ ] Login works with test account
- [ ] Image uploads working
- [ ] MOL file downloads working
- [ ] PM2 auto-start on reboot configured

---

## 🚨 Troubleshooting

### 502 Bad Gateway
```bash
# Check PHP-FPM running
sudo systemctl status php8.2-fpm
# Check socket exists
ls -la /run/php/php8.2-fpm-herbaldb.sock
```

### CORS Errors
```bash
# Check .env settings
cat /home/htdocs/herbaldb/backend/.env | grep -E "FRONTEND|SANCTUM"
# Clear config cache
php artisan config:clear && php artisan config:cache
```

### Permission Denied
```bash
sudo chown -R www-data:www-data /home/htdocs/herbaldb
sudo chmod -R 755 /home/htdocs/herbaldb
sudo chmod -R 775 /home/htdocs/herbaldb/backend/storage
```

### PM2 Memory Issues
```bash
pm2 restart herbaldb-frontend --update-env
pm2 monit
```

---

## 📞 Quick Reference

| Service | URL |
|---------|-----|
| Frontend | https://herbaldb.site |
| API | https://api.herbaldb.site/api/v1 |
| Admin Login | https://herbaldb.site/login |

| Credentials | Test Account |
|-------------|--------------|
| Admin | admin@herbaldb.com / admin123 |

---

*Last updated: February 2026*
