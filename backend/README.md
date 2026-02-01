# 🏠 Immobilien Ghumman - Backend API

Vollständiges Backend-System für die Immobilienverwaltung mit Node.js, Express, MySQL und Cloud-Integration.

---

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Technologie-Stack](#-technologie-stack)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Datenbank Setup](#-datenbank-setup)
- [Server starten](#-server-starten)
- [API Endpoints](#-api-endpoints)
- [Frontend Integration](#-frontend-integration)
- [Deployment](#-deployment)
- [Sicherheit](#-sicherheit)

---

## ✨ Features

### Authentifizierung & Autorisierung
- ✅ JWT-basierte Authentifizierung
- ✅ Rollenbasierte Zugriffskontrolle (Admin, Manager, Agent, User)
- ✅ Passwort-Hashing mit Bcrypt
- ✅ Session Management
- ✅ Passwort ändern Funktion

### Immobilienverwaltung
- ✅ Vollständiges CRUD für Immobilien
- ✅ Erweiterte Filterung (Typ, Angebot, Preis, Größe, Standort)
- ✅ Pagination & Sortierung
- ✅ Multi-Image Upload
- ✅ Featured Properties
- ✅ Ähnliche Immobilien Finder
- ✅ View Counter

### Bild-Upload & Verwaltung
- ✅ Cloudinary Integration
- ✅ Automatische Bildoptimierung
- ✅ Thumbnail-Generierung
- ✅ Multiple Images pro Immobilie
- ✅ Primary Image Selection
- ✅ Image Delete Funktion

### Kontakt & Anfragen
- ✅ Anfrage-Formular für Immobilien
- ✅ Allgemeines Kontaktformular
- ✅ Email-Benachrichtigungen (Admin & Kunde)
- ✅ Anfrage-Status Management
- ✅ Anfrage-Statistiken

### Benutzerverwaltung
- ✅ User CRUD (Admin)
- ✅ Rollen-Zuweisung
- ✅ Account Status Management
- ✅ Benutzer-Statistiken
- ✅ Profil-Bearbeitung

### Sicherheit & Performance
- ✅ Helmet Security Headers
- ✅ CORS Protection
- ✅ Rate Limiting (100 req/15min)
- ✅ Input Validation
- ✅ SQL Injection Prevention
- ✅ Response Compression
- ✅ Request Logging

---

## 🛠 Technologie-Stack

### Backend
- **Node.js** v18+ - JavaScript Runtime
- **Express.js** v4.18 - Web Framework
- **MySQL** v8.0 - Relationale Datenbank

### Authentifizierung & Sicherheit
- **JSON Web Token (JWT)** - Token-basierte Auth
- **Bcryptjs** - Password Hashing
- **Helmet** - Security Headers
- **Express Rate Limit** - API Rate Limiting

### Cloud Services
- **Cloudinary** - Image Upload & CDN
- **Nodemailer** - Email Versand

### Middleware & Utilities
- **Multer** - File Upload Handling
- **Express-validator** - Input Validation
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP Request Logger
- **Compression** - Response Compression
- **dotenv** - Environment Variables

---

## 📦 Installation

### 1. Voraussetzungen

Stelle sicher, dass folgende Software installiert ist:

```bash
# Node.js (v18 oder höher)
node --version

# npm (kommt mit Node.js)
npm --version

# MySQL (v8.0 oder höher)
mysql --version
```

### 2. Repository klonen

```bash
cd "C:\Users\ahsin\Proton Drive\Ah.Af.Ghumman.17\My files\website Ghumman\backend"
```

### 3. Dependencies installieren

```bash
npm install
```

Dies installiert alle Pakete aus `package.json`:
- express, mysql2, bcryptjs, jsonwebtoken
- multer, cloudinary, nodemailer
- helmet, cors, express-rate-limit
- express-validator, compression, morgan

---

## ⚙️ Konfiguration

### 1. Environment Variables erstellen

Kopiere `.env.example` zu `.env`:

```bash
copy .env.example .env
```

### 2. .env Datei bearbeiten

Öffne `.env` und fülle alle Werte aus:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=dein_mysql_passwort
DB_NAME=immobilien_ghumman

# JWT Configuration
JWT_SECRET=dein_super_geheimer_jwt_schluessel_min_32_zeichen
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (kostenlos registrieren auf cloudinary.com)
CLOUDINARY_CLOUD_NAME=dein_cloud_name
CLOUDINARY_API_KEY=dein_api_key
CLOUDINARY_API_SECRET=dein_api_secret

# Email Configuration (z.B. Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deine_email@gmail.com
EMAIL_PASSWORD=dein_app_passwort
EMAIL_FROM="Immobilien Ghumman <noreply@immobilien-ghumman.de>"
ADMIN_EMAIL=admin@immobilien-ghumman.de

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/jpg

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Cloudinary Account erstellen

1. Gehe zu https://cloudinary.com
2. Erstelle kostenlosen Account
3. Dashboard → Account Details
4. Kopiere: Cloud Name, API Key, API Secret
5. Füge in `.env` ein

### 4. Gmail App-Passwort erstellen

Für Email-Versand mit Gmail:

1. Google Account → Sicherheit
2. 2-Faktor-Authentifizierung aktivieren
3. App-Passwörter → Neues App-Passwort erstellen
4. Wähle "Mail" und "Windows-Computer"
5. Kopiere generiertes Passwort in `.env` als `EMAIL_PASSWORD`

---

## 🗄️ Datenbank Setup

### 1. MySQL Datenbank erstellen

```bash
mysql -u root -p
```

```sql
CREATE DATABASE immobilien_ghumman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Datenbank initialisieren

Dies erstellt alle Tabellen und einen Standard-Admin-User:

```bash
npm run init-db
```

**Standard Admin-Zugangsdaten:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@immobilien-ghumman.de`

**⚠️ WICHTIG:** Ändere das Admin-Passwort nach dem ersten Login!

### 3. Überprüfe Datenbank-Struktur

```sql
USE immobilien_ghumman;
SHOW TABLES;
```

Du solltest folgende Tabellen sehen:
- `users` - Benutzer mit Rollen
- `properties` - Immobilien
- `property_images` - Bilder zu Immobilien
- `inquiries` - Anfragen
- `favorites` - User-Favoriten
- `activity_logs` - Aktivitätsprotokolle

---

## 🚀 Server starten

### Development Mode (mit auto-reload)

```bash
npm run dev
```

Server läuft auf: http://localhost:3000

### Production Mode

```bash
npm start
```

### Überprüfe Server-Status

Öffne im Browser:
```
http://localhost:3000/api/health
```

Erwartete Antwort:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

---

## 📡 API Endpoints

### Authentifizierung (`/api/auth`)

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| POST | `/register` | Neuen User registrieren | - |
| POST | `/login` | User einloggen | - |
| GET | `/me` | Aktuellen User abrufen | ✅ |
| PUT | `/change-password` | Passwort ändern | ✅ |
| POST | `/logout` | User ausloggen | ✅ |

### Immobilien (`/api/properties`)

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| GET | `/` | Alle Immobilien (mit Filtern) | - |
| GET | `/:id` | Einzelne Immobilie | - |
| POST | `/` | Neue Immobilie erstellen | Admin/Manager/Agent |
| PUT | `/:id` | Immobilie bearbeiten | Admin/Manager/Agent |
| DELETE | `/:id` | Immobilie löschen | Admin/Manager/Agent |
| GET | `/:id/similar` | Ähnliche Immobilien | - |

**Filter-Parameter für GET `/properties`:**
- `type` - Wohnung, Haus, Gewerbe, Grundstück
- `offer_type` - Verkauf, Miete
- `city` - Stadt
- `min_price` / `max_price` - Preisbereich
- `min_size` / `max_size` - Größenbereich
- `rooms` - Anzahl Zimmer
- `featured` - Nur empfohlene (true/false)
- `status` - active, sold, reserved
- `sort_by` - price, size, created_at
- `sort_order` - asc, desc
- `page` - Seitennummer
- `limit` - Einträge pro Seite

### Upload (`/api/upload`)

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| POST | `/image` | Einzelnes Bild hochladen | Admin/Manager/Agent |
| POST | `/property-images` | Mehrere Bilder hochladen | Admin/Manager/Agent |
| DELETE | `/image/:cloudinary_id` | Bild löschen | Admin/Manager/Agent |

### Kontakt (`/api/contact`)

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| POST | `/inquiry` | Immobilien-Anfrage senden | - |
| GET | `/inquiries` | Alle Anfragen abrufen | Admin/Manager |
| GET | `/inquiries/:id` | Einzelne Anfrage | Admin/Manager |
| PUT | `/inquiries/:id` | Anfrage-Status ändern | Admin/Manager |
| POST | `/general` | Allgemeine Kontaktanfrage | - |
| GET | `/stats` | Anfrage-Statistiken | Admin/Manager |

### Benutzer (`/api/users`)

| Method | Endpoint | Beschreibung | Auth |
|--------|----------|--------------|------|
| GET | `/` | Alle Benutzer | Admin |
| GET | `/:id` | Einzelner Benutzer | Admin/Selbst |
| POST | `/` | Neuen Benutzer erstellen | Admin |
| PUT | `/:id` | Benutzer bearbeiten | Admin/Selbst |
| DELETE | `/:id` | Benutzer löschen | Admin |
| GET | `/stats/overview` | Benutzer-Statistiken | Admin |

---

## 🌐 Frontend Integration

### 1. API Client einbinden

Füge in deine HTML-Dateien ein:

```html
<script src="js/api-client.js"></script>
```

### 2. API verwenden

```javascript
// Login
const result = await api.login('admin', 'admin123');
console.log('Token:', result.token);

// Immobilien laden
const data = await api.getProperties({ type: 'Wohnung', city: 'Frankfurt' });
console.log('Properties:', data.properties);

// Neue Immobilie erstellen
const newProperty = await api.createProperty({
    title: 'Schöne 3-Zimmer-Wohnung',
    type: 'Wohnung',
    offer_type: 'Verkauf',
    price: 350000,
    size: 85,
    rooms: 3,
    location: 'Frankfurt Nordend',
    description: 'Tolle Wohnung...',
    features: ['Balkon', 'Parkplatz']
});

// Bilder hochladen
const fileInput = document.querySelector('#imageInput');
const files = fileInput.files;
await api.uploadPropertyImages(newProperty.property.id, files);

// Anfrage senden
await api.submitInquiry({
    property_id: 123,
    name: 'Max Mustermann',
    email: 'max@example.com',
    phone: '0123456789',
    message: 'Ich interessiere mich für diese Immobilie...'
});
```

### 3. Admin-Seiten aktualisieren

Die folgenden Dateien müssen aktualisiert werden:

#### admin-login.html
Ersetze localStorage-Login mit API:

```javascript
// Altes localStorage-System entfernen
// Neues API-System verwenden:
const result = await api.login(username, password);
// Token wird automatisch gespeichert
window.location.href = 'admin-dashboard.html';
```

#### admin-dashboard.html
Lade Immobilien von API:

```javascript
const data = await api.getProperties();
displayProperties(data.properties);
```

#### admin-upload.html
File-Upload statt URL-Input:

```html
<input type="file" id="propertyImages" multiple accept="image/*">
```

```javascript
// Nach Property-Erstellung:
const files = document.querySelector('#propertyImages').files;
if (files.length > 0) {
    await api.uploadPropertyImages(propertyId, files);
}
```

---

## 🌍 Deployment

### Option 1: Lokaler Server (Windows)

1. **Firewall-Regel erstellen:**
```powershell
New-NetFirewallRule -DisplayName "Immobilien Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

2. **Server als Windows-Dienst:**

Installiere `node-windows`:
```bash
npm install -g node-windows
```

Erstelle `install-service.js`:
```javascript
var Service = require('node-windows').Service;
var svc = new Service({
  name: 'Immobilien Ghumman API',
  description: 'Backend API für Immobilien Website',
  script: 'C:\\...\\backend\\server.js',
  nodeOptions: ['--max_old_space_size=4096']
});
svc.on('install', () => svc.start());
svc.install();
```

Ausführen:
```bash
node install-service.js
```

### Option 2: Cloud Hosting (Empfohlen)

#### Heroku Deployment

1. **Heroku CLI installieren**
2. **App erstellen:**
```bash
heroku create immobilien-ghumman-api
```

3. **MySQL Addon hinzufügen:**
```bash
heroku addons:create jawsdb:kitefin
```

4. **Environment Variables setzen:**
```bash
heroku config:set JWT_SECRET=dein_secret
heroku config:set CLOUDINARY_CLOUD_NAME=...
# etc.
```

5. **Deployen:**
```bash
git push heroku main
```

#### DigitalOcean / AWS / Azure

1. VPS mit Ubuntu 20.04 erstellen
2. Node.js installieren
3. MySQL installieren
4. Repository klonen
5. Dependencies installieren
6. PM2 für Process Management:
```bash
npm install -g pm2
pm2 start server.js --name immobilien-api
pm2 startup
pm2 save
```

7. Nginx als Reverse Proxy:
```nginx
server {
    listen 80;
    server_name api.immobilien-ghumman.de;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Sicherheit

### Best Practices

✅ **Implementiert:**
- Passwort-Hashing mit Bcrypt (10 Salt Rounds)
- JWT-Tokens mit 7-Tage-Ablauf
- Rate Limiting (100 Anfragen/15min)
- Helmet Security Headers
- Input Validation mit express-validator
- SQL Injection Prevention (Prepared Statements)
- CORS Configuration

⚠️ **Noch zu tun:**
- [ ] HTTPS/SSL Zertifikat einrichten
- [ ] JWT Refresh Tokens implementieren
- [ ] 2-Faktor-Authentifizierung
- [ ] Audit Logging erweitern
- [ ] Brute-Force Protection verbessern
- [ ] Content Security Policy konfigurieren

### Passwort-Regeln

Standard-Regeln (anpassbar in auth.routes.js):
- Mindestlänge: 6 Zeichen
- Empfohlen: 12+ Zeichen mit Mix aus Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen

### API Rate Limits

Standard: 100 Anfragen pro 15 Minuten pro IP
Anpassbar in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to database"

**Lösung:**
1. MySQL Server läuft? `services.msc` → MySQL80
2. `.env` Zugangsdaten korrekt?
3. Firewall blockiert Port 3306?

### Problem: "JWT malformed"

**Lösung:**
1. Token abgelaufen? Neu einloggen
2. `JWT_SECRET` in `.env` gesetzt?
3. Browser Cache/Cookies leeren

### Problem: "Cloudinary upload failed"

**Lösung:**
1. Cloudinary-Credentials in `.env` korrekt?
2. Bild zu groß? Max 5MB (anpassbar)
3. Dateiformat erlaubt? (JPEG, PNG, WebP)

### Problem: "Email not sent"

**Lösung:**
1. Gmail App-Passwort erstellt?
2. 2FA aktiviert in Google Account?
3. SMTP-Settings korrekt?

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Initiales Release
- ✅ Vollständige API-Implementierung
- ✅ JWT-Authentifizierung
- ✅ Cloudinary-Integration
- ✅ Email-Service
- ✅ Admin Dashboard
- ✅ Property Management
- ✅ User Management
- ✅ Inquiry System

---

## 👨‍💻 Support

Bei Fragen oder Problemen:
- Email: support@immobilien-ghumman.de
- Tel: +49 (0) 160 98787878

---

## 📄 Lizenz

© 2024 Immobilien Ghumman. Alle Rechte vorbehalten.

---

**Viel Erfolg mit deiner Immobilien-Website! 🎉**
