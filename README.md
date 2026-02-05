# HerbalDB Indonesia 🌿

![Status](https://img.shields.io/badge/Status-Active%20Development-green)
![Laravel](https://img.shields.io/badge/Backend-Laravel%2010-red)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)

Database komprehensif tanaman herbal Indonesia dan senyawa bioaktifnya. Proyek ini merupakan modernisasi dari sistem legacy HerbalDB 2014.

## 📊 Database Statistics

| Data | Jumlah |
|------|--------|
| Spesies | 3,815 |
| Senyawa | 651 |
| Nama Lokal | 10,674 |
| Khasiat | 6,612 |
| Referensi | 24 |
| Bagian Tanaman | 58 |
| File MOL | 1,458 (59 linked) |

## 🏗️ Project Structure

```
herbaldb2014-revamp/
├── backend/          # Laravel 10 REST API
├── frontend/         # Next.js 14+ Frontend (App Router)
└── old-herbaldb/     # Legacy PHP code (v3/, mol/, images/)
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 10.x (PHP 8.1+)
- **Database**: MySQL/MariaDB
- **Authentication**: Laravel Sanctum
- **Authorization**: Spatie Permission (Role-based)
- **API Format**: RESTful JSON

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query + Zustand
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- PHP 8.1+
- Composer 2.x
- Node.js 18+
- MySQL 8.0+ / MariaDB 10.5+

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure database in .env
# DB_DATABASE=herbaldb
# DB_USERNAME=root
# DB_PASSWORD=

php artisan migrate
php artisan herbaldb:import-legacy --force  # Import 3,815 species
php artisan serve --port=8001
```

> Setelah menarik perubahan terbaru, jalankan kembali `php artisan migrate` untuk menambahkan kolom molekuler pada tabel `compounds` dan kolom `created_by` pada tabel `references`.

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api/v1" > .env.local

npm run dev -- -p 3001
```

Access:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001/api/v1

## 📥 Legacy Data Import

### Full Import (Production)

```bash
cd backend
php artisan herbaldb:import-legacy --fresh --force
```

This imports:
- **24 References** - Source citations
- **19 Compound Groups** - Chemical classifications  
- **50 Plant Parts** - Herba, Daun, Akar, etc.
- **3,815 Species** - Indonesian herbal plants
- **651 Compounds** - Bioactive compounds
- **10,674 Local Names** - Regional/vernacular names
- **292 Species Aliases** - Scientific synonyms
- **6,612 Virtues** - Traditional uses & benefits
- **937 Species-Compound Links** - Compound distribution

### MOL Files (Molecular Structure)

```bash
# Link MOL files to compounds
php artisan db:seed --class=LinkMolFilesSeeder
```

MOL files accessible at: `http://localhost:8001/mol/mol1/{filename}.mol`

### Sample Data Only (Development)

```bash
php artisan migrate:fresh --seed
```

## 👤 Default Users

| Role        | Email                    | Password     |
|-------------|--------------------------|--------------|
| Admin       | admin@herbaldb.com       | admin123     |
| Verifier    | verifier@herbaldb.com    | verifier123  |
| Contributor | contributor@herbaldb.com | contrib123   |

## 📡 API Endpoints

Base URL: `http://localhost:8001/api/v1`

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/species` | List species (paginated) |
| GET | `/species/{id}` | Species detail + relations |
| GET | `/species/search` | Search species |
| GET | `/compounds` | List compounds (paginated) |
| GET | `/compounds/{id}` | Compound detail |
| GET | `/compounds/search` | Search compounds |
| GET | `/stats` | Database statistics |
| GET | `/references` | List/search references |
| GET | `/plant-parts` | List plant parts |
| GET | `/contributors` | Top contributors |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/register` | User registration |
| POST | `/logout` | Logout (auth required) |
| GET | `/me` | Current user profile |

### Protected (Auth Required)
| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/species` | contributor |
| PUT | `/species/{id}` | contributor/owner |
| POST | `/species/{id}/submit` | contributor/owner |
| POST | `/species/{id}/verify` | verifier |
| PUT | `/species/{id}/status` | verifier |
| POST | `/species/{id}/photo` | contributor/owner |
| DELETE | `/species/{id}/photo` | contributor/owner |
| DELETE | `/species/{id}` | admin |
| POST | `/compounds` | contributor |
| PUT | `/compounds/{id}` | contributor/owner |
| POST | `/compounds/{id}/submit` | contributor/owner |
| POST | `/compounds/{id}/verify` | verifier |
| PUT | `/compounds/{id}/status` | verifier |
| POST | `/compounds/{id}/contribute-molecular` | authenticated |
| DELETE | `/compounds/{id}` | admin |
| POST | `/references` | authenticated |
| PUT | `/references/{id}` | contributor/verifier/admin |
| DELETE | `/references/{id}` | admin |

## 📄 Frontend Pages

### Public Pages
- `/` - Homepage dengan statistik & fitur unggulan
- `/spesies` - Daftar semua spesies tanaman
- `/spesies/[id]` - Detail spesies + senyawa + khasiat
- `/senyawa` - Daftar semua senyawa bioaktif
- `/senyawa/[id]` - Detail senyawa + spesies terkait
- `/cari` - Pencarian spesies & senyawa
- `/tentang` - Tentang HerbalDB
- `/kontributor` - Daftar kontributor
- `/donasi` - Halaman donasi

### Dashboard (Auth Required)
- `/dashboard` - Overview statistics
- `/dashboard/species` - Manage species (list, status filter)
- `/dashboard/species/new` - Create new species
- `/dashboard/species/[id]/edit` - Edit species
- `/dashboard/compounds` - Manage compounds (list, group filter)
- `/dashboard/compounds/new` - Create new compound
- `/dashboard/compounds/[id]/edit` - Edit compound
- `/dashboard/references` - Manage references (search, add, edit, delete)
- `/dashboard/reviews` - Review pending items (Verifier only)
- `/dashboard/submissions` - View my submissions (Contributor)
- `/dashboard/profile` - Edit profile + avatar

## 👥 User Roles & Workflow

### Role Permissions

| Role | Species | Compounds | Review | Admin |
|------|---------|-----------|--------|-------|
| **Contributor** | Create, Edit own draft/rejected | Create, Edit own draft/rejected | - | - |
| **Verifier** | All Contributor + Approve/Reject | All Contributor + Approve/Reject | ✅ | - |
| **Admin** | Full access | Full access | ✅ | ✅ |

### Approval Workflow

```
Contributor Creates → DRAFT → Submit for Review → PENDING
                                                      ↓
                         PUBLISHED ← Approve ← Verifier Reviews
                                                      ↓
                             REJECTED ← Reject (with notes)
                                ↓
                    Contributor Edits → Re-submit
```

1. **Contributor** creates species/compound (status: `draft`)
2. **Contributor** submits for review (status: `pending`)
3. **Verifier** reviews and approves/rejects
4. If approved: status → `published` (visible publicly)
5. If rejected: status → `rejected` with notes, Contributor can edit and re-submit

## 🔧 Environment Variables

### Backend (.env)
```env
APP_NAME=HerbalDB
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.herbaldb.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=herbaldb
DB_USERNAME=herbaldb_user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=herbaldb.id,www.herbaldb.id
SESSION_DOMAIN=.herbaldb.id
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.herbaldb.id/api/v1
```

## 🚢 Production Deployment

### 1. Server Requirements
- PHP 8.1+ with extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- MySQL 8.0+ / MariaDB 10.5+
- Node.js 18+ 
- Composer 2.x
- Nginx / Apache

### 2. Backend Deployment

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan herbaldb:import-legacy --force
php artisan storage:link
```

### 3. Frontend Deployment

```bash
cd frontend
npm ci --production
npm run build
npm start -- -p 3000
```

Or use PM2:
```bash
pm2 start npm --name "herbaldb-frontend" -- start -- -p 3000
```

### 4. Nginx Configuration

```nginx
# API Backend
server {
    listen 80;
    server_name api.herbaldb.id;
    root /var/www/herbaldb/backend/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Frontend
server {
    listen 80;
    server_name herbaldb.id www.herbaldb.id;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📋 Database Schema

### Core Tables
- `species` - Tanaman herbal (scientific_name, family, variety, description)
- `compounds` - Senyawa bioaktif (name, molecular_formula, molecular_weight, cas_number, smiles, inchi, inchi_key, mol_file_path, mol2_file_path)
- `local_names` - Nama daerah (species_id, name, language)
- `virtues` - Khasiat/manfaat (species_id, virtue)
- `compound_species` - Pivot table relasi senyawa-spesies

### Supporting Tables
- `references` - Sumber referensi (source_name, authors, year, type, url, created_by)
- `compound_groups` - Klasifikasi senyawa
- `plant_parts` - Bagian tanaman
- `users`, `roles`, `permissions` - User management

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Changelog

### v2.0.0 (2024) - Revamp
- ✅ Migrasi dari PHP legacy ke Laravel 10 + Next.js 14
- ✅ Import 3,815 spesies dan 651 senyawa dari database lama
- ✅ Implementasi role-based access control (Admin, Verifier, Contributor)
- ✅ UI modern dengan Tailwind CSS + shadcn/ui
- ✅ Pencarian spesies dan senyawa
- ✅ Halaman detail dengan relasi lengkap
- ✅ Statistik database di homepage
- ✅ Halaman kontributor dan donasi
- ✅ Link file MOL ke senyawa (59 senyawa - MOL1: 52, MOL2: 7)
- ✅ CRUD Species di dashboard dengan nama lokal & khasiat
- ✅ CRUD Compounds di dashboard dengan filter grup
- ✅ Approval workflow (Contributor → Verifier → Published)
- ✅ Dashboard submissions untuk Contributor
- ✅ Dashboard reviews untuk Verifier
- ✅ Image placeholder pada detail spesies
- ✅ Kolom molekuler baru (formula, berat, CAS, SMILES, InChI, InChI Key) + kontribusi publik
- ✅ Manajemen referensi di dashboard + kolom `created_by`
- ✅ Endpoint plant parts untuk kontribusi khasiat per bagian tanaman

### v1.0.0 (2014) - Legacy
- PHP procedural dengan MySQL
- Basic CRUD operations
- Static HTML templates

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- **Original HerbalDB** - Developed by Annisa Prida pada 2014 
- **Revamp Team** - Modern implementation with Laravel + Next.js
- **Data Sources** - Various Indonesian herbal research publications

---

Made with ❤️ for Indonesian Herbal Heritage
