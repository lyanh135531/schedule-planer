# Hướng dẫn Deploy với Docker

## ✅ Checklist trước khi start

- [ ] Docker Desktop đã được cài đặt và đang chạy
- [ ] Port 5432 không bị chiếm bởi PostgreSQL khác
- [ ] Port 3000 không bị chiếm
- [ ] Đã chạy `npm install`

## 🚀 Các bước deploy

### 1. Start Docker containers

```bash
npm run docker:up
```

Lệnh này sẽ:

- Tạo PostgreSQL container (port 5432)
- Tạo Next.js app container (port 3000)
- Chạy `docker/init.sql` để tạo tables

### 2. Setup database (seed data)

```bash
npm run db:setup
```

Lệnh này sẽ:

- Chờ database sẵn sàng (tối đa 30 giây)
- Seed 3 course types (Main, Free Talk, Skills)
- Seed mock courses từ TalkFirst API structure

### 3. Start development server

```bash
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🔄 Lệnh nhanh (All-in-one)

```bash
npm run docker:restart
```

Lệnh này sẽ:

1. Stop và xóa containers cũ
2. Start containers mới
3. Đợi 5 giây
4. Setup database tự động

---

## 🛠️ Troubleshooting

### Lỗi: "Cannot connect to Docker daemon"

**Nguyên nhân**: Docker Desktop chưa chạy

**Giải pháp**:

1. Mở Docker Desktop
2. Đợi Docker khởi động hoàn toàn (icon Docker Desktop màu xanh)
3. Chạy lại `npm run docker:up`

### Lỗi: "Port 5432 already in use"

**Nguyên nhân**: PostgreSQL local đang chạy

**Giải pháp**:

```bash
# Windows
net stop postgresql-x64-15

# Hoặc đổi port trong docker-compose.yml
ports:
  - "5433:5432"  # Đổi từ 5432 sang 5433
```

### Lỗi: "Database connection refused"

**Nguyên nhân**: Database chưa sẵn sàng

**Giải pháp**:

```bash
# Kiểm tra database status
docker ps

# Xem logs
docker logs talkfirst-support-db-1

# Chờ và thử lại
npm run db:wait
```

### Lỗi: "Module not found"

**Nguyên nhân**: Dependencies chưa được cài

**Giải pháp**:

```bash
npm install
```

---

## 📊 Kiểm tra deployment

### 1. Kiểm tra containers đang chạy

```bash
docker ps
```

Kết quả mong đợi:

```
CONTAINER ID   IMAGE                    STATUS
xxxxx          talkfirst-support-app    Up
xxxxx          postgres:15-alpine       Up (healthy)
```

### 2. Kiểm tra database

```bash
# Kết nối vào PostgreSQL
docker exec -it talkfirst-support-db-1 psql -U postgres -d talkfirst

# Kiểm tra tables
\dt

# Kiểm tra course types
SELECT * FROM course_types;

# Kiểm tra courses
SELECT COUNT(*) FROM courses;

# Thoát
\q
```

### 3. Kiểm tra API endpoints

```bash
# Test login (mock)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test courses
curl http://localhost:3000/api/courses

# Test course types filter
curl http://localhost:3000/api/courses?type=skills
```

---

## 🧹 Dọn dẹp

### Stop containers (giữ data)

```bash
npm run docker:down
```

### Stop và xóa tất cả (bao gồm data)

```bash
docker-compose down -v
```

### Xóa images

```bash
docker rmi talkfirst-support-app
docker rmi postgres:15-alpine
```

---

## 📝 Environment Variables

File `.env.local` (cho local development):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/talkfirst
MAIN_API_URL=https://your-api.com
CRON_SECRET=your_secret_key
```

**Lưu ý**:

- `DATABASE_URL` phải dùng `localhost` khi chạy `npm run dev` bên ngoài Docker
- Password mặc định là `password` (xem `docker-compose.yml`)

---

## 🎯 Next Steps

Sau khi deploy thành công:

1. **Tích hợp TalkFirst API**
   - Cập nhật `MAIN_API_URL` trong `.env.local`
   - Tạo API route để sync courses từ TalkFirst

2. **Phát triển UI**
   - Tạo trang settings cho user requirements
   - Tạo course planning interface
   - Implement backup course selection

3. **Testing**
   - Test time conflict detection
   - Test backup priority logic
   - Test registration flow

---

## 📚 Tài liệu tham khảo

- [README.md](./README.md) - Tài liệu đầy đủ
- [QUICKSTART.md](./QUICKSTART.md) - Hướng dẫn nhanh
- [Database Schema](./lib/db/schema.ts) - Chi tiết database
- [API Routes](./app/api/) - Danh sách endpoints
