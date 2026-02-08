#!/bin/bash
# HerbalDB Initial Setup Script
# Run this on your Debian 13 server

set -e

echo "=========================================="
echo "  HerbalDB Initial Setup for Debian 13"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables - EDIT THESE
DOMAIN="herbaldb.site"
API_DOMAIN="api.herbaldb.site"
INSTALL_PATH="/home/htdocs/herbaldb"
DB_NAME="herbaldb"
DB_USER="herbaldb_user"
DB_PASS="ChangeThisSecurePassword123!"

echo -e "${YELLOW}Step 1: Installing PHP 8.2...${NC}"
sudo apt update
sudo apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-curl \
    php8.2-mbstring php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl php8.2-readline

echo -e "${YELLOW}Step 2: Installing Composer...${NC}"
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
fi

echo -e "${YELLOW}Step 3: Creating directory structure...${NC}"
sudo mkdir -p $INSTALL_PATH/logs
sudo chown -R $USER:$USER $INSTALL_PATH

echo -e "${YELLOW}Step 4: Cloning repository...${NC}"
cd /home/htdocs
if [ -d "herbaldb" ]; then
    echo "Directory exists, pulling latest..."
    cd herbaldb && git pull origin develop
else
    git clone https://github.com/annisaprida/herbaldb2014.git herbaldb
    cd herbaldb
fi

echo -e "${YELLOW}Step 5: Setting up Backend...${NC}"
cd backend
composer install --no-dev --optimize-autoloader

if [ ! -f .env ]; then
    cp .env.example .env
    
    # Update .env with production values
    sed -i "s|APP_ENV=local|APP_ENV=production|g" .env
    sed -i "s|APP_DEBUG=true|APP_DEBUG=false|g" .env
    sed -i "s|APP_URL=.*|APP_URL=https://$API_DOMAIN|g" .env
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_NAME|g" .env
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=$DB_USER|g" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|g" .env
    
    # Add Sanctum config
    echo "" >> .env
    echo "SESSION_DOMAIN=.${DOMAIN}" >> .env
    echo "SANCTUM_STATEFUL_DOMAINS=${DOMAIN},www.${DOMAIN}" >> .env
    echo "FRONTEND_URL=https://${DOMAIN}" >> .env
    
    php artisan key:generate
fi

echo -e "${YELLOW}Step 6: Setting up Frontend...${NC}"
cd ../frontend
npm ci --only=production

if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api/v1" > .env.local
    echo "NEXT_PUBLIC_STORAGE_URL=https://${API_DOMAIN}/storage" >> .env.local
fi

npm run build

echo -e "${YELLOW}Step 7: Setting permissions...${NC}"
sudo chown -R www-data:www-data $INSTALL_PATH/backend
sudo chmod -R 755 $INSTALL_PATH
sudo chmod -R 775 $INSTALL_PATH/backend/storage
sudo chmod -R 775 $INSTALL_PATH/backend/bootstrap/cache

echo -e "${GREEN}=========================================="
echo "  Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Create database: sudo mysql -u root"
echo "   CREATE DATABASE $DB_NAME;"
echo "   CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';"
echo "   GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
echo ""
echo "2. Update password in: $INSTALL_PATH/backend/.env"
echo ""
echo "3. Run migrations:"
echo "   cd $INSTALL_PATH/backend"
echo "   php artisan migrate --force"
echo "   php artisan herbaldb:import-legacy --fresh --force"
echo "   php artisan storage:link"
echo "   php artisan config:cache"
echo ""
echo "4. Setup PM2 for frontend:"
echo "   cd $INSTALL_PATH/frontend"
echo "   pm2 start npm --name 'herbaldb' -- start"
echo "   pm2 save && pm2 startup"
echo ""
echo "5. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo "6. Get SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
