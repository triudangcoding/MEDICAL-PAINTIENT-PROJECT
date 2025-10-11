# Hệ Thống Quản Lý Y Tế - Use Cases và ERD

## Tổng Quan Hệ Thống

Hệ thống quản lý y tế là một ứng dụng web toàn diện được xây dựng với NestJS (Backend) và React (Frontend), hỗ trợ quản lý đơn thuốc điện tử, theo dõi tuân thủ uống thuốc, và các chức năng y tế khác.

### Kiến Trúc Hệ Thống
- **Backend**: NestJS với Prisma ORM, PostgreSQL
- **Frontend**: React với TypeScript
- **Authentication**: JWT với Passport
- **Real-time**: WebSocket với Socket.IO
- **Scheduling**: Cron jobs cho nhắc nhở thuốc
- **Notifications**: Email và WebSocket notifications

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                MEDICAL MANAGEMENT SYSTEM                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────────────┐
│      User       │    │   MajorDoctorTable   │    │     PatientProfile          │
├─────────────────┤    ├──────────────────────┤    ├─────────────────────────────┤
│ id (PK)         │    │ id (PK)              │    │ id (PK)                     │
│ phoneNumber (U) │    │ code (U)             │    │ userId (FK, U)              │
│ password        │    │ name                 │    │ gender                      │
│ fullName        │    │ nameEn               │    │ birthDate                   │
│ role            │    │ description          │    │ address                     │
│ status          │    │ isActive             │    │ createdAt                   │
│ createdAt       │    │ sortOrder            │    │ updatedAt                   │
│ updatedAt       │    │ createdAt            │    └─────────────────────────────┘
│ deletedAt       │    │ updatedAt            │              │
│ createdBy (FK)  │    └──────────────────────┘              │
│ majorDoctorId(FK)│              │                           │
└─────────────────┘              │                           │
         │                         │                           │
         │ 1:N                     │ 1:N                       │ 1:1
         │                         │                           │
         ▼                         ▼                           ▼
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────────────┐
│   Prescription  │    │        User          │    │ PatientMedicalHistory       │
├─────────────────┤    │    (Doctors)         │    ├─────────────────────────────┤
│ id (PK)         │    │                      │    │ id (PK)                     │
│ patientId (FK)  │    │                      │    │ patientId (FK, U)           │
│ doctorId (FK)   │    │                      │    │ conditions[]                │
│ status          │    │                      │    │ allergies[]                │
│ startDate       │    │                      │    │ surgeries[]                 │
│ endDate         │    │                      │    │ familyHistory               │
│ notes           │    │                      │    │ lifestyle                   │
│ createdAt       │    │                      │    │ currentMedications[]       │
│ updatedAt       │    │                      │    │ notes                       │
└─────────────────┘    │                      │    │ extras (JSON)               │
         │              │                      │    │ createdAt                   │
         │ 1:N          │                      │    │ updatedAt                   │
         │              │                      │    └─────────────────────────────┘
         ▼              │                      │
┌─────────────────┐    │                      │
│PrescriptionItem │    │                      │
├─────────────────┤    │                      │
│ id (PK)         │    │                      │
│ prescriptionId(FK)│   │                      │
│ medicationId (FK)│   │                      │
│ dosage          │    │                      │
│ frequencyPerDay │    │                      │
│ timesOfDay[]    │    │                      │
│ durationDays    │    │                      │
│ route           │    │                      │
│ instructions    │    │                      │
│ createdAt       │    │                      │
│ updatedAt       │    │                      │
└─────────────────┘    │                      │
         │              │                      │
         │ 1:N          │                      │
         ▼              │                      │
┌─────────────────┐    │                      │
│  AdherenceLog   │    │                      │
├─────────────────┤    │                      │
│ id (PK)         │    │                      │
│ prescriptionId(FK)│   │                      │
│ prescriptionItemId(FK)│ │                      │
│ patientId (FK)  │    │                      │
│ takenAt         │    │                      │
│ status          │    │                      │
│ amount          │    │                      │
│ notes           │    │                      │
│ createdAt       │    │                      │
│ updatedAt       │    │                      │
└─────────────────┘    │                      │
         │              │                      │
         │              │                      │
         ▼              │                      │
┌─────────────────┐    │                      │
│     Alert       │    │                      │
├─────────────────┤    │                      │
│ id (PK)         │    │                      │
│ prescriptionId(FK)│   │                      │
│ patientId (FK)  │    │                      │
│ doctorId (FK)   │    │                      │
│ type            │    │                      │
│ message         │    │                      │
│ resolved        │    │                      │
│ createdAt       │    │                      │
│ updatedAt       │    │                      │
└─────────────────┘    │                      │
                        │                      │
                        ▼                      ▼
                ┌─────────────────┐    ┌─────────────────┐
                │   Medication    │    │     User        │
                ├─────────────────┤    │   (Patients)    │
                │ id (PK)         │    │                 │
                │ name            │    │                 │
                │ strength        │    │                 │
                │ form            │    │                 │
                │ unit            │    │                 │
                │ description     │    │                 │
                │ isActive        │    │                 │
                │ createdAt       │    │                 │
                │ updatedAt       │    │                 │
                └─────────────────┘    └─────────────────┘
```

## Use Cases Chi Tiết

### 1. QUẢN TRỊ VIÊN (ADMIN)

#### UC-ADMIN-001: Quản Lý Người Dùng
**Mô tả**: Admin có thể tạo, xem, cập nhật và xóa người dùng trong hệ thống
**Actor**: Admin
**Preconditions**: Admin đã đăng nhập
**Main Flow**:
1. Admin truy cập trang quản lý người dùng
2. Hệ thống hiển thị danh sách người dùng với phân trang
3. Admin có thể:
   - Tạo người dùng mới (bác sĩ/bệnh nhân)
   - Xem chi tiết thông tin người dùng
   - Cập nhật thông tin người dùng
   - Xóa người dùng (soft delete)
   - Tìm kiếm người dùng theo tên, số điện thoại
4. Hệ thống lưu thay đổi và cập nhật danh sách

#### UC-ADMIN-002: Quản Lý Chuyên Khoa
**Mô tả**: Admin quản lý các chuyên khoa bác sĩ
**Actor**: Admin
**Main Flow**:
1. Admin truy cập trang quản lý chuyên khoa
2. Hệ thống hiển thị danh sách chuyên khoa
3. Admin có thể:
   - Tạo chuyên khoa mới
   - Cập nhật thông tin chuyên khoa
   - Kích hoạt/vô hiệu hóa chuyên khoa
   - Xóa chuyên khoa
4. Hệ thống cập nhật danh sách bác sĩ thuộc chuyên khoa

#### UC-ADMIN-003: Quản Lý Thuốc
**Mô tả**: Admin quản lý danh mục thuốc trong hệ thống
**Actor**: Admin
**Main Flow**:
1. Admin truy cập trang quản lý thuốc
2. Hệ thống hiển thị danh sách thuốc
3. Admin có thể:
   - Thêm thuốc mới vào danh mục
   - Cập nhật thông tin thuốc (tên, liều lượng, dạng bào chế)
   - Kích hoạt/vô hiệu hóa thuốc
   - Xóa thuốc khỏi danh mục

#### UC-ADMIN-004: Xem Báo Cáo Tổng Quan
**Mô tả**: Admin xem các báo cáo thống kê tổng quan hệ thống
**Actor**: Admin
**Main Flow**:
1. Admin truy cập trang báo cáo
2. Hệ thống hiển thị:
   - Tổng số đơn thuốc
   - Số bệnh nhân đang điều trị
   - Tỷ lệ tuân thủ uống thuốc
   - Thống kê theo thời gian
3. Admin có thể xuất báo cáo

#### UC-ADMIN-005: Quản Lý Đơn Thuốc
**Mô tả**: Admin có thể xem, chỉnh sửa và quản lý tất cả đơn thuốc
**Actor**: Admin
**Main Flow**:
1. Admin truy cập trang quản lý đơn thuốc
2. Hệ thống hiển thị danh sách đơn thuốc
3. Admin có thể:
   - Xem chi tiết đơn thuốc
   - Chỉnh sửa đơn thuốc
   - Hủy đơn thuốc
   - Xem nhật ký tuân thủ của bệnh nhân

### 2. BÁC SĨ (DOCTOR)

#### UC-DOCTOR-001: Quản Lý Bệnh Nhân
**Mô tả**: Bác sĩ quản lý danh sách bệnh nhân của mình
**Actor**: Doctor
**Preconditions**: Bác sĩ đã đăng nhập
**Main Flow**:
1. Bác sĩ truy cập trang quản lý bệnh nhân
2. Hệ thống hiển thị danh sách bệnh nhân được phân công
3. Bác sĩ có thể:
   - Xem thông tin chi tiết bệnh nhân
   - Xem lịch sử điều trị
   - Xem hồ sơ bệnh án
   - Cập nhật thông tin bệnh nhân

#### UC-DOCTOR-002: Kê Đơn Thuốc Điện Tử
**Mô tả**: Bác sĩ tạo đơn thuốc điện tử cho bệnh nhân
**Actor**: Doctor
**Main Flow**:
1. Bác sĩ chọn bệnh nhân cần kê đơn
2. Hệ thống hiển thị form tạo đơn thuốc
3. Bác sĩ:
   - Chọn thuốc từ danh mục
   - Nhập liều lượng, tần suất uống
   - Chọn thời gian uống trong ngày
   - Nhập thời gian điều trị
   - Thêm ghi chú
4. Bác sĩ xác nhận tạo đơn thuốc
5. Hệ thống lưu đơn thuốc và gửi thông báo cho bệnh nhân

#### UC-DOCTOR-003: Chỉnh Sửa Đơn Thuốc
**Mô tả**: Bác sĩ cập nhật đơn thuốc khi cần thiết
**Actor**: Doctor
**Main Flow**:
1. Bác sĩ chọn đơn thuốc cần chỉnh sửa
2. Hệ thống hiển thị form chỉnh sửa
3. Bác sĩ cập nhật thông tin:
   - Thay đổi thuốc
   - Điều chỉnh liều lượng
   - Thay đổi thời gian uống
   - Cập nhật ghi chú
4. Bác sĩ xác nhận thay đổi
5. Hệ thống cập nhật đơn thuốc và thông báo cho bệnh nhân

#### UC-DOCTOR-004: Giám Sát Tuân Thủ Uống Thuốc
**Mô tả**: Bác sĩ theo dõi việc tuân thủ uống thuốc của bệnh nhân
**Actor**: Doctor
**Main Flow**:
1. Bác sĩ truy cập trang giám sát tuân thủ
2. Hệ thống hiển thị danh sách bệnh nhân với tỷ lệ tuân thủ
3. Bác sĩ có thể:
   - Xem chi tiết nhật ký uống thuốc của từng bệnh nhân
   - Xem biểu đồ tuân thủ theo thời gian
   - Nhận cảnh báo khi bệnh nhân có tỷ lệ tuân thủ thấp
   - Gửi nhắc nhở cho bệnh nhân

#### UC-DOCTOR-005: Xem Lịch Sử Điều Trị
**Mô tả**: Bác sĩ xem lịch sử điều trị của bệnh nhân
**Actor**: Doctor
**Main Flow**:
1. Bác sĩ chọn bệnh nhân
2. Hệ thống hiển thị:
   - Danh sách đơn thuốc đã kê
   - Lịch sử tuân thủ uống thuốc
   - Các cảnh báo đã gửi
   - Ghi chú điều trị
3. Bác sĩ có thể xuất báo cáo điều trị

### 3. BỆNH NHÂN (PATIENT)

#### UC-PATIENT-001: Xem Đơn Thuốc
**Mô tả**: Bệnh nhân xem đơn thuốc hiện tại của mình
**Actor**: Patient
**Preconditions**: Bệnh nhân đã đăng nhập
**Main Flow**:
1. Bệnh nhân truy cập trang đơn thuốc
2. Hệ thống hiển thị đơn thuốc đang hoạt động
3. Bệnh nhân có thể xem:
   - Danh sách thuốc
   - Liều lượng và cách uống
   - Thời gian uống trong ngày
   - Ghi chú từ bác sĩ

#### UC-PATIENT-002: Xem Lịch Nhắc Uống Thuốc
**Mô tả**: Bệnh nhân xem lịch nhắc uống thuốc hàng ngày
**Actor**: Patient
**Main Flow**:
1. Bệnh nhân truy cập trang lịch uống thuốc
2. Hệ thống hiển thị:
   - Lịch uống thuốc hôm nay
   - Lịch uống thuốc theo tuần/tháng
   - Trạng thái đã uống/chưa uống
3. Bệnh nhân có thể xem chi tiết từng thời điểm uống thuốc

#### UC-PATIENT-003: Xác Nhận Đã Uống Thuốc
**Mô tả**: Bệnh nhân xác nhận đã uống thuốc theo lịch
**Actor**: Patient
**Main Flow**:
1. Bệnh nhân nhận thông báo nhắc uống thuốc
2. Bệnh nhân truy cập trang xác nhận uống thuốc
3. Bệnh nhân:
   - Xác nhận đã uống thuốc
   - Nhập số lượng đã uống (nếu khác với liều quy định)
   - Thêm ghi chú (nếu có)
4. Hệ thống lưu nhật ký và cập nhật trạng thái

#### UC-PATIENT-004: Đánh Dấu Bỏ Lỡ Thuốc
**Mô tả**: Bệnh nhân đánh dấu khi bỏ lỡ uống thuốc
**Actor**: Patient
**Main Flow**:
1. Bệnh nhân nhận ra đã bỏ lỡ uống thuốc
2. Bệnh nhân truy cập trang đánh dấu bỏ lỡ
3. Bệnh nhân:
   - Chọn thời điểm đã bỏ lỡ
   - Nhập lý do bỏ lỡ (tùy chọn)
4. Hệ thống lưu nhật ký và gửi cảnh báo cho bác sĩ

#### UC-PATIENT-005: Xem Lịch Sử Dùng Thuốc
**Mô tả**: Bệnh nhân xem lịch sử dùng thuốc của mình
**Actor**: Patient
**Main Flow**:
1. Bệnh nhân truy cập trang lịch sử
2. Hệ thống hiển thị:
   - Nhật ký uống thuốc theo thời gian
   - Tỷ lệ tuân thủ
   - Các lần bỏ lỡ thuốc
   - Biểu đồ tuân thủ
3. Bệnh nhân có thể xuất báo cáo cá nhân

#### UC-PATIENT-006: Quản Lý Hồ Sơ Bệnh Án
**Mô tả**: Bệnh nhân xem và cập nhật thông tin sức khỏe cá nhân
**Actor**: Patient
**Main Flow**:
1. Bệnh nhân truy cập trang hồ sơ bệnh án
2. Hệ thống hiển thị:
   - Thông tin cá nhân
   - Tiền sử bệnh
   - Dị ứng
   - Phẫu thuật
   - Thuốc đang dùng
3. Bệnh nhân có thể cập nhật một số thông tin (theo quy định)

### 4. HỆ THỐNG (SYSTEM)

#### UC-SYSTEM-001: Gửi Nhắc Nhở Uống Thuốc
**Mô tả**: Hệ thống tự động gửi nhắc nhở uống thuốc
**Actor**: System
**Trigger**: Cron job chạy mỗi phút
**Main Flow**:
1. Hệ thống kiểm tra thời gian hiện tại
2. Tìm các đơn thuốc có thời gian uống sắp tới
3. Gửi thông báo cho bệnh nhân qua:
   - WebSocket (real-time)
   - Email (nếu được cấu hình)
4. Lưu log nhắc nhở

#### UC-SYSTEM-002: Tạo Cảnh Báo Tuân Thủ Thấp
**Mô tả**: Hệ thống tự động tạo cảnh báo khi bệnh nhân có tỷ lệ tuân thủ thấp
**Actor**: System
**Trigger**: Cron job chạy hàng ngày lúc 9:00
**Main Flow**:
1. Hệ thống tính toán tỷ lệ tuân thủ của từng bệnh nhân (7 ngày gần nhất)
2. Nếu tỷ lệ tuân thủ < 70%:
   - Tạo cảnh báo cho bác sĩ
   - Gửi thông báo qua WebSocket
3. Lưu log cảnh báo

#### UC-SYSTEM-003: Xử Lý WebSocket Connections
**Mô tả**: Hệ thống quản lý kết nối WebSocket cho real-time notifications
**Actor**: System
**Main Flow**:
1. Client kết nối WebSocket với authentication
2. Hệ thống xác thực user
3. Join user vào room tương ứng với role
4. Gửi/nhận real-time notifications
5. Xử lý disconnect và cleanup

## Workflow Diagrams

### Workflow 1: Quy Trình Kê Đơn Thuốc

```
[Bác sĩ] → [Chọn bệnh nhân] → [Tạo đơn thuốc] → [Chọn thuốc] → [Nhập liều lượng]
    ↓
[Thiết lập lịch uống] → [Xác nhận đơn thuốc] → [Hệ thống lưu] → [Gửi thông báo cho bệnh nhân]
    ↓
[Bệnh nhân nhận thông báo] → [Xem đơn thuốc] → [Nhận nhắc nhở uống thuốc]
```

### Workflow 2: Quy Trình Theo Dõi Tuân Thủ

```
[Hệ thống kiểm tra định kỳ] → [Tính tỷ lệ tuân thủ] → [Tạo cảnh báo nếu cần]
    ↓
[Bác sĩ nhận cảnh báo] → [Xem chi tiết] → [Gửi nhắc nhở cho bệnh nhân]
    ↓
[Bệnh nhân nhận nhắc nhở] → [Xác nhận uống thuốc] → [Cập nhật nhật ký]
```

### Workflow 3: Quy Trình Nhắc Nhở Uống Thuốc

```
[Cron job mỗi phút] → [Kiểm tra thời gian uống thuốc] → [Tìm bệnh nhân cần nhắc]
    ↓
[Gửi thông báo WebSocket] → [Bệnh nhân nhận thông báo] → [Xác nhận uống thuốc]
    ↓
[Cập nhật AdherenceLog] → [Kiểm tra tuân thủ] → [Tạo cảnh báo nếu cần]
```

## Các Tính Năng Nâng Cao

### 1. Real-time Notifications
- WebSocket cho thông báo tức thời
- Email notifications cho các sự kiện quan trọng
- Push notifications (có thể mở rộng)

### 2. Medication Adherence Tracking
- Theo dõi tỷ lệ tuân thủ uống thuốc
- Cảnh báo tự động khi tuân thủ thấp
- Báo cáo chi tiết cho bác sĩ và bệnh nhân

### 3. Automated Scheduling
- Cron jobs cho nhắc nhở thuốc
- Tự động tạo cảnh báo tuân thủ
- Lên lịch các công việc định kỳ

### 4. Role-based Access Control
- Phân quyền chi tiết theo vai trò
- JWT authentication với refresh token
- Middleware bảo mật

### 5. Data Analytics & Reporting
- Thống kê tổng quan hệ thống
- Báo cáo tuân thủ uống thuốc
- Phân tích xu hướng điều trị

## Kết Luận

Hệ thống quản lý y tế này cung cấp một giải pháp toàn diện cho việc quản lý đơn thuốc điện tử và theo dõi tuân thủ uống thuốc. Với kiến trúc modular, hệ thống dễ dàng mở rộng và bảo trì. Các tính năng real-time và automation giúp cải thiện chất lượng chăm sóc y tế và tăng tỷ lệ tuân thủ điều trị của bệnh nhân.
