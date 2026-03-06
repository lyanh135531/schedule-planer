# Quick Start Guide

## 🚀 Khởi động dự án với Docker

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Start Docker và setup database

```bash
# Cách 1: Tất cả trong một lệnh (khuyến nghị)
npm run docker:restart

# Cách 2: Từng bước
npm run docker:up      # Start Docker containers
npm run db:setup       # Chờ database sẵn sàng và seed data
```

### Bước 3: Start development server

```bash
npm run dev
```

Mở trình duyệt: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Các lệnh hữu ích

### Docker

```bash
npm run docker:up        # Khởi động Docker containers
npm run docker:down      # Tắt Docker containers
npm run docker:restart   # Restart Docker + setup database
```

### Database

```bash
npm run db:wait    # Chờ database sẵn sàng
npm run db:seed    # Seed data vào database
npm run db:setup   # Chờ + seed (setup đầy đủ)
```

### Development

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run start    # Chạy production server
```

---

## 📊 Kiểm tra database

### Kết nối vào PostgreSQL

```bash
docker exec -it talkfirst-support-db-1 psql -U postgres -d talkfirst
```

### Các lệnh SQL hữu ích

```sql
-- Xem tất cả tables
\dt

-- Xem course types
SELECT * FROM course_types;

-- Xem courses
SELECT * FROM courses;

-- Xem user plans
SELECT * FROM user_course_plans;

-- Thoát
\q
```

---

## 🐛 Troubleshooting

### Docker không khởi động được

1. Kiểm tra Docker Desktop đang chạy
2. Chạy: `docker-compose down -v` để xóa volumes cũ
3. Chạy lại: `npm run docker:restart`

### Database connection error

1. Đợi vài giây để database khởi động hoàn toàn
2. Chạy: `npm run db:wait` để kiểm tra
3. Nếu vẫn lỗi, restart Docker: `npm run docker:restart`

### Port 5432 đã được sử dụng

1. Tắt PostgreSQL local nếu đang chạy
2. Hoặc đổi port trong `docker-compose.yml`

---

## 📁 Cấu trúc Database

### 5 Tables chính:

1. **course_types** - Loại khóa học (Main, Free Talk, Skills)
2. **user_course_settings** - Cài đặt số lượng khóa học cần đăng ký
3. **courses** - Danh sách khóa học từ TalkFirst API
4. **user_course_plans** - Kế hoạch đăng ký (primary + backup)
5. **submission_history** - Lịch sử đăng ký

---

## 🎯 Workflow phát triển

1. **Start Docker**: `npm run docker:up`
2. **Setup DB**: `npm run db:setup` (chỉ cần 1 lần)
3. **Dev**: `npm run dev`
4. **Code**: Sửa code, auto reload
5. **Test**: `npm run build` để kiểm tra build

---

## 📝 Environment Variables

File `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/talkfirst
CRON_SECRET=your_secret
```

**Lưu ý**: Không cần thay đổi `DATABASE_URL` nếu dùng Docker mặc định.
