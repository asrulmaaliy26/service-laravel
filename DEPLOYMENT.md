# Panduan Deployment CBT App ke VPS

## 🎯 Masalah yang Diselesaikan
- Session hilang antara frontend (VPS) dan backend (localhost)
- Cookie SameSite blocking
- Mixed content (HTTPS → HTTP)
- Camera API tidak berfungsi di non-secure context

## 📋 Langkah-Langkah Deployment

### **Opsi 1: Backend dan Frontend di VPS yang Sama (RECOMMENDED)**

#### 1. Upload Backend Siakad ke VPS
```bash
# Di VPS, clone atau upload project backend
cd /var/www/
git clone <repo-backend-siakad>
# atau upload via FTP/SFTP

# Setup database
mysql -u root -p
CREATE DATABASE siakad_db;
# Import database

# Setup permissions
sudo chown -R www-data:www-data /var/www/siakad
sudo chmod -R 755 /var/www/siakad
```

#### 2. Konfigurasi Nginx/Apache
```nginx
# /etc/nginx/sites-available/siakad.conf
server {
    listen 80;
    server_name siakad.staialmannan.ac.id;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name siakad.staialmannan.ac.id;
    
    ssl_certificate /etc/letsencrypt/live/siakad.staialmannan.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siakad.staialmannan.ac.id/privkey.pem;
    
    root /var/www/siakad/public;
    index index.php index.html;
    
    # Frontend CBT App
    location /cbt-app/ {
        alias /var/www/siakad/public/cbt-app/;
        try_files $uri $uri/ /cbt-app/index.html;
    }
    
    # Backend PHP
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

#### 3. Update Config Frontend
Di `frontend/config.ts`:
```typescript
export const ENV = {
  MODE: 'production',
  BACKEND_URL: {
    development: 'http://localhost:8080',
    production: 'https://siakad.staialmannan.ac.id' // Same domain!
  }
};
```

#### 4. Build dan Deploy Frontend
```bash
# Di lokal (folder frontend)
npm run build

# Upload folder dist ke VPS
scp -r dist/* user@vps:/var/www/siakad/public/cbt-app/
```

---

### **Opsi 2: Backend Tetap di Localhost (Gunakan Ngrok)**

#### 1. Install Ngrok
```bash
# Download dari https://ngrok.com/download
# Atau via package manager:
choco install ngrok  # Windows
brew install ngrok   # Mac
```

#### 2. Jalankan Ngrok
```bash
ngrok http 8080
```

Output:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

#### 3. Update Config Frontend
Di `frontend/config.ts`:
```typescript
export const ENV = {
  MODE: 'production',
  BACKEND_URL: {
    development: 'http://localhost:8080',
    production: 'https://abc123.ngrok-free.app' // URL dari ngrok
  }
};
```

#### 4. Build dan Upload
```bash
npm run build
scp -r dist/* user@vps:/var/www/siakad/public/cbt-app/
```

#### ⚠️ Catatan Ngrok:
- URL berubah setiap restart (kecuali pakai akun berbayar)
- Harus selalu running saat ujian berlangsung
- Ada batasan bandwidth di free tier

---

### **Opsi 3: Gunakan Token Authentication (Tanpa Session)**

Jika tidak bisa pakai Opsi 1 atau 2, ubah mekanisme auth:

#### Backend (CodeIgniter):
```php
// app/Controllers/Ujian.php
public function showSoal()
{
    $token = $this->request->getGet('token');
    
    // Validasi token
    $user = $this->validateToken($token);
    if (!$user) {
        return redirect()->to('/login');
    }
    
    // Lanjutkan ke ujian
    // ...
}

private function validateToken($token)
{
    // Cek token di database atau JWT
    return $this->userModel->getUserByToken($token);
}
```

#### Frontend:
```typescript
// Saat redirect ke ujian, tambahkan token
const examUrl = `${getBackendUrl()}/akademik/ujian/showSoal?token=${userToken}&jns_ujian=uas&...`;
```

---

## 🔧 Troubleshooting

### Camera Tidak Muncul
✅ Pastikan akses lewat HTTPS atau localhost
✅ Cek browser console untuk error
✅ Izinkan camera permission di browser

### Session Hilang
✅ Pastikan backend dan frontend same-origin
✅ Cek cookie SameSite settings
✅ Gunakan token jika cross-origin tidak bisa dihindari

### CORS Error
Tambahkan di backend (PHP):
```php
header('Access-Control-Allow-Origin: https://siakad.staialmannan.ac.id');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

---

## 📝 Checklist Deployment

- [ ] SSL Certificate terpasang (HTTPS)
- [ ] Backend accessible dari VPS
- [ ] Frontend config.ts sudah diupdate
- [ ] Build frontend (`npm run build`)
- [ ] Upload ke VPS
- [ ] Test camera permission
- [ ] Test violation logging
- [ ] Test fullscreen mode
- [ ] Test timer functionality

---

## 🎯 Rekomendasi Akhir

**Untuk Production:**
→ Gunakan **Opsi 1** (Backend + Frontend di VPS yang sama)

**Untuk Development/Testing:**
→ Gunakan **Opsi 2** (Ngrok)

**Jika Terpaksa:**
→ Gunakan **Opsi 3** (Token Auth)
