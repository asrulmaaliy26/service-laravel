# CBT App - Quick Start Guide

## 📁 Struktur Project

```
service-laravel/
├── frontend/              # Source code React/Vite
│   ├── config.ts         # ⭐ Konfigurasi environment (EDIT INI!)
│   ├── pages/
│   ├── components/
│   └── ...
├── public/
│   └── cbt-app/          # Build hasil (upload folder ini ke VPS)
├── build-cbt.bat         # Script build otomatis (Windows)
└── DEPLOYMENT.md         # Panduan deployment lengkap
```

## 🚀 Quick Start

### 1. Development (Localhost)

```bash
cd frontend
npm install
npm run dev
```

Akses: `http://localhost:8000/cbt-app/`

### 2. Production (VPS)

#### Step 1: Update Config
Edit `frontend/config.ts`:
```typescript
export const ENV = {
  MODE: 'production', // ⬅️ Ubah ke production
  BACKEND_URL: {
    development: 'http://localhost:8080',
    production: 'https://siakad.staialmannan.ac.id' // ⬅️ URL VPS Anda
  }
};
```

#### Step 2: Build
**Windows:**
```bash
build-cbt.bat
```

**Linux/Mac:**
```bash
cd frontend
npm run build
cp -r dist/* ../public/cbt-app/
```

#### Step 3: Upload ke VPS
```bash
# Via SCP
scp -r public/cbt-app/* user@vps:/var/www/siakad/public/cbt-app/

# Atau via FTP/FileZilla
# Upload folder public/cbt-app/ ke server
```

## ⚙️ Konfigurasi Backend URL

### Skenario 1: Backend di VPS yang Sama
```typescript
production: 'https://siakad.staialmannan.ac.id'
```

### Skenario 2: Backend di Localhost (Pakai Ngrok)
```bash
# Jalankan ngrok
ngrok http 8080

# Copy URL yang muncul
# Contoh: https://abc123.ngrok-free.app
```

```typescript
production: 'https://abc123.ngrok-free.app'
```

## 🔧 Troubleshooting

### Camera Tidak Muncul
- ✅ Pastikan akses lewat **HTTPS** atau **localhost**
- ✅ Klik ikon gembok di browser → Allow Camera
- ✅ Cek console browser (F12) untuk error

### Session Hilang / Redirect ke Login
- ✅ Pastikan backend URL benar di `config.ts`
- ✅ Cek apakah backend dan frontend same-origin
- ✅ Lihat panduan lengkap di `DEPLOYMENT.md`

### Build Error
```bash
# Clear cache dan reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Dokumentasi Lengkap

Lihat file `DEPLOYMENT.md` untuk:
- Panduan deployment detail
- Konfigurasi Nginx/Apache
- Setup SSL certificate
- Troubleshooting lengkap

## 🎯 Checklist Sebelum Upload ke VPS

- [ ] Update `frontend/config.ts` dengan URL production
- [ ] Build frontend (`build-cbt.bat` atau `npm run build`)
- [ ] Test di localhost terlebih dahulu
- [ ] Upload folder `public/cbt-app/` ke VPS
- [ ] Test camera permission di VPS
- [ ] Test violation logging
- [ ] Test timer dan fullscreen

## 📞 Support

Jika ada masalah, cek:
1. Browser console (F12 → Console)
2. Network tab (F12 → Network)
3. File `DEPLOYMENT.md` untuk solusi umum
