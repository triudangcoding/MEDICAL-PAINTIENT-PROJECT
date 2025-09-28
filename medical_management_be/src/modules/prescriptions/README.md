# Module Đơn Thuốc (Prescriptions Module)

## Tổng quan

Module đơn thuốc cung cấp đầy đủ chức năng quản lý đơn thuốc điện tử và giám sát tuân thủ uống thuốc từ xa theo ý tưởng trong hình.

## Các tính năng chính

### 🔹 Admin
- **Xem báo cáo tổng quan**: Tổng số đơn thuốc, số bệnh nhân đang điều trị, tỷ lệ tuân thủ
- **Quản lý đơn thuốc**: Xem, sửa, xóa tất cả đơn thuốc trong hệ thống
- **Theo dõi tuân thủ**: Xem nhật ký uống thuốc của tất cả bệnh nhân

### 🔹 Bác sĩ (Doctor)
- **Kê đơn thuốc điện tử**: Chọn thuốc từ danh mục, nhập liều lượng, thời gian uống
- **Chỉnh sửa đơn thuốc**: Cập nhật khi bệnh nhân tái khám hoặc cần đổi thuốc
- **Xem lịch sử điều trị**: Hiển thị các đơn thuốc cũ của bệnh nhân để tham khảo
- **Giám sát việc dùng thuốc**: Xem lịch sử xác nhận uống thuốc của bệnh nhân
- **Nhận cảnh báo**: Cảnh báo khi bệnh nhân bỏ thuốc nhiều lần

### 🔹 Bệnh nhân (Patient)
- **Xem đơn thuốc**: Hiển thị đầy đủ thuốc, liều lượng, giờ uống
- **Xem lịch nhắc uống thuốc**: Lịch hằng ngày theo đơn bác sĩ đã kê
- **Nhận thông báo nhắc thuốc**: Hệ thống gửi nhắc nhở đến giờ uống
- **Xác nhận đã uống thuốc**: Bấm nút xác nhận → hệ thống lưu lại để bác sĩ giám sát
- **Xem lịch sử dùng thuốc**: Biết mình có uống đủ liều hay bỏ quên

## API Endpoints

### 📋 Prescriptions (Chung)
- `GET /prescriptions/:id` - Xem chi tiết đơn thuốc
- `GET /prescriptions/:id/adherence-logs` - Xem nhật ký tuân thủ
- `GET /prescriptions/patient/:patientId/schedule` - Xem lịch uống thuốc
- `POST /prescriptions/:id/log-adherence` - Ghi nhật ký uống thuốc

### 👨‍⚕️ Doctor Prescriptions
- `POST /doctor/prescriptions` - Tạo đơn thuốc mới
- `GET /doctor/prescriptions` - Xem đơn thuốc của bác sĩ
- `GET /doctor/prescriptions/patient/:patientId` - Xem đơn thuốc của bệnh nhân cụ thể
- `PATCH /doctor/prescriptions/:id` - Cập nhật đơn thuốc
- `GET /doctor/prescriptions/patient/:patientId/adherence` - Xem tình trạng tuân thủ

### 🏥 Patient Prescriptions
- `GET /patient/prescriptions` - Xem đơn thuốc của mình
- `GET /patient/prescriptions/schedule` - Xem lịch uống thuốc
- `GET /patient/prescriptions/today` - Xem lịch hôm nay
- `POST /patient/prescriptions/:id/confirm-taken` - Xác nhận đã uống thuốc
- `POST /patient/prescriptions/:id/mark-missed` - Đánh dấu bỏ lỡ thuốc
- `GET /patient/prescriptions/:id/history` - Xem lịch sử uống thuốc

### 🔧 Admin Prescriptions
- `GET /admin/prescriptions` - Xem tất cả đơn thuốc
- `GET /admin/prescriptions/stats` - Xem thống kê tổng quan
- `GET /admin/prescriptions/:id` - Xem chi tiết đơn thuốc
- `PATCH /admin/prescriptions/:id` - Cập nhật đơn thuốc
- `GET /admin/prescriptions/doctor/:doctorId` - Xem đơn thuốc của bác sĩ
- `GET /admin/prescriptions/patient/:patientId` - Xem đơn thuốc của bệnh nhân
- `GET /admin/prescriptions/:id/adherence-logs` - Xem nhật ký tuân thủ
- `GET /admin/prescriptions/patient/:patientId/schedule` - Xem lịch uống thuốc

## Cấu trúc Database

### Prescription (Đơn thuốc)
```typescript
{
  id: string;
  patientId: string;
  doctorId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PrescriptionItem (Dòng đơn thuốc)
```typescript
{
  id: string;
  prescriptionId: string;
  medicationId: string;
  dosage: string; // "1 viên"
  frequencyPerDay: number; // 3
  timesOfDay: string[]; // ["08:00", "14:00", "20:00"]
  durationDays: number; // 7
  route?: string; // "uống"
  instructions?: string;
}
```

### AdherenceLog (Nhật ký tuân thủ)
```typescript
{
  id: string;
  prescriptionId: string;
  prescriptionItemId?: string;
  patientId: string;
  takenAt: Date;
  status: 'TAKEN' | 'MISSED' | 'SKIPPED';
  amount?: string;
  notes?: string;
}
```

### Alert (Cảnh báo/Nhắc nhở)
```typescript
{
  id: string;
  prescriptionId?: string;
  patientId: string;
  doctorId?: string;
  type: 'MISSED_DOSE' | 'LOW_ADHERENCE' | 'OTHER';
  message: string;
  resolved: boolean;
  createdAt: Date;
}
```

## Ví dụ sử dụng

### 1. Bác sĩ tạo đơn thuốc
```typescript
POST /doctor/prescriptions
{
  "patientId": "patient-uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "notes": "Uống sau ăn",
  "items": [
    {
      "medicationId": "med-uuid",
      "dosage": "1 viên",
      "frequencyPerDay": 3,
      "timesOfDay": ["08:00", "14:00", "20:00"],
      "durationDays": 7,
      "route": "uống",
      "instructions": "Uống sau ăn no"
    }
  ]
}
```

### 2. Bệnh nhân xác nhận uống thuốc
```typescript
POST /patient/prescriptions/prescription-uuid/confirm-taken
{
  "prescriptionItemId": "item-uuid",
  "amount": "1 viên",
  "notes": "Đã uống sau ăn sáng"
}
```

### 3. Xem lịch uống thuốc hôm nay
```typescript
GET /patient/prescriptions/today
```

### 4. Bác sĩ xem tình trạng tuân thủ
```typescript
GET /doctor/prescriptions/patient/patient-uuid/adherence
```

## Tự động hóa

### Scheduled Tasks
- **Nhắc nhở uống thuốc**: Chạy mỗi phút để tạo nhắc nhở theo giờ đã định
- **Cảnh báo tuân thủ thấp**: Chạy hàng ngày lúc 9:00 sáng để kiểm tra tỷ lệ tuân thủ

### Notifications
- Tự động tạo cảnh báo khi bệnh nhân bỏ lỡ liều thuốc
- Tự động tạo cảnh báo khi tỷ lệ tuân thủ thấp
- Nhắc nhở uống thuốc theo lịch đã định

## Bảo mật

- **Phân quyền**: Mỗi role chỉ có thể truy cập dữ liệu phù hợp
- **Validation**: Kiểm tra đầy đủ dữ liệu đầu vào
- **Audit**: Ghi log tất cả hoạt động quan trọng

## Monitoring

- **Thống kê tổng quan**: Tổng số đơn thuốc, bệnh nhân, tỷ lệ tuân thủ
- **Theo dõi real-time**: Nhật ký uống thuốc được cập nhật ngay lập tức
- **Cảnh báo**: Hệ thống tự động cảnh báo khi có vấn đề về tuân thủ
