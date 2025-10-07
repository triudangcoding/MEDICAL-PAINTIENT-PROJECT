# Scripts để cập nhật dữ liệu với bác sĩ điều trị

## Mô tả
Các script này giúp cập nhật database để tất cả bệnh nhân đều có bác sĩ điều trị.

## Scripts có sẵn

### 1. `reseed-with-doctors.ts`
- Chạy seed database mới với tất cả bệnh nhân đều có bác sĩ điều trị
- Kiểm tra và hiển thị thống kê kết quả

### 2. `assign-patients-to-doctors.ts`
- Gán bệnh nhân hiện tại (chưa có bác sĩ) cho bác sĩ ngẫu nhiên
- Không xóa dữ liệu hiện tại

## Cách chạy

### Option 1: Reseed hoàn toàn (Khuyến nghị)
```bash
cd medical_management_be
npx ts-node scripts/reseed-with-doctors.ts
```

### Option 2: Chỉ gán bệnh nhân hiện tại
```bash
cd medical_management_be
npx ts-node scripts/assign-patients-to-doctors.ts
```

### Option 3: Chạy seed thủ công
```bash
cd medical_management_be
yarn db:seed
```

## Kết quả mong đợi

Sau khi chạy script, tất cả bệnh nhân sẽ có:
- `createdBy` field được set với ID của bác sĩ
- `createdByUser` relation sẽ trả về thông tin bác sĩ điều trị
- UI sẽ hiển thị tên bác sĩ và chuyên khoa

## Lưu ý
- Script sẽ xóa toàn bộ dữ liệu hiện tại (nếu dùng reseed)
- Backup dữ liệu quan trọng trước khi chạy
- Đảm bảo database connection hoạt động bình thường
