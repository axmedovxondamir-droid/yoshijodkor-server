# Maktab Market — Backend Server

## O'rnatish

```bash
cd server
npm install
```

## Ishga tushirish

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server: http://localhost:5000

## API Endpoints

### Auth
POST /api/auth/login      — kirish
GET  /api/auth/me         — profil

### Products
GET    /api/products      — barchasi
GET    /api/products/:id  — bitta
POST   /api/products      — qo'shish (admin)
PUT    /api/products/:id  — yangilash (admin)
DELETE /api/products/:id  — o'chirish (admin)

### Orders
POST /api/orders           — buyurtma berish
GET  /api/orders           — barchasi (admin)
PUT  /api/orders/:id/status — holat (admin)

### Custom Orders
POST /api/custom-orders           — maxsus buyurtma
GET  /api/custom-orders           — barchasi (admin)
PUT  /api/custom-orders/:id/status — holat (admin)

### Users
GET    /api/users          — barchasi (admin)
POST   /api/users          — qo'shish (admin)
PUT    /api/users/:id      — yangilash (admin)
DELETE /api/users/:id      — o'chirish (admin)
PATCH  /api/users/:id/toggle — bloklash (admin)

## Ma'lumotlar
db/db.json faylida saqlanadi

## Default admin
Login: admin
Parol: admin123
