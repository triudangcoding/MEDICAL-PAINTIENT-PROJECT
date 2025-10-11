# Use Cases Documentation

## Tổng Quan

Thư mục này chứa tài liệu chi tiết về các use cases của hệ thống quản lý y tế. Mỗi use case được mô tả đầy đủ với các thành phần chính như preconditions, main flow, alternative flows, business rules, và success criteria.

## Cấu Trúc Thư Mục

```
use-cases/
├── admin/           # Use cases cho Admin (Quản trị viên)
├── doctor/          # Use cases cho Doctor (Bác sĩ)
├── patient/         # Use cases cho Patient (Bệnh nhân)
├── system/          # Use cases cho System (Hệ thống)
└── README.md        # File này
```

## Danh Sách Use Cases

### 🔹 Admin (Quản trị viên)
- **UC-ADMIN-001**: Quản Lý Người Dùng
- **UC-ADMIN-002**: Quản Lý Chuyên Khoa
- **UC-ADMIN-003**: Quản Lý Thuốc
- **UC-ADMIN-004**: Xem Báo Cáo Tổng Quan
- **UC-ADMIN-005**: Quản Lý Đơn Thuốc

### 🔹 Doctor (Bác sĩ)
- **UC-DOCTOR-001**: Quản Lý Bệnh Nhân
- **UC-DOCTOR-002**: Kê Đơn Thuốc Điện Tử
- **UC-DOCTOR-003**: Chỉnh Sửa Đơn Thuốc
- **UC-DOCTOR-004**: Giám Sát Tuân Thủ Uống Thuốc
- **UC-DOCTOR-005**: Xem Lịch Sử Điều Trị

### 🔹 Patient (Bệnh nhân)
- **UC-PATIENT-001**: Xem Đơn Thuốc
- **UC-PATIENT-002**: Xem Lịch Nhắc Uống Thuốc
- **UC-PATIENT-003**: Xác Nhận Đã Uống Thuốc
- **UC-PATIENT-004**: Đánh Dấu Bỏ Lỡ Thuốc
- **UC-PATIENT-005**: Xem Lịch Sử Dùng Thuốc
- **UC-PATIENT-006**: Quản Lý Hồ Sơ Bệnh Án

### 🔹 System (Hệ thống)
- **UC-SYSTEM-001**: Gửi Nhắc Nhở Uống Thuốc
- **UC-SYSTEM-002**: Tạo Cảnh Báo Tuân Thủ Thấp
- **UC-SYSTEM-003**: Xử Lý WebSocket Connections

## Cấu Trúc Use Case

Mỗi use case được mô tả với các thành phần sau:

### 1. Thông Tin Cơ Bản
- **ID**: Mã định danh duy nhất
- **Tên**: Tên use case
- **Actor**: Người thực hiện use case
- **Mô tả**: Mô tả ngắn gọn về use case
- **Priority**: Mức độ ưu tiên (High/Medium/Low)
- **Complexity**: Độ phức tạp (High/Medium/Low)

### 2. Preconditions
Các điều kiện cần thiết trước khi thực hiện use case

### 3. Main Flow
Luồng chính của use case với các bước chi tiết

### 4. Alternative Flows
Các luồng thay thế khi có exception hoặc điều kiện đặc biệt

### 5. Postconditions
Kết quả sau khi thực hiện use case thành công

### 6. Business Rules
Các quy tắc nghiệp vụ cần tuân thủ

### 7. Data Requirements
Dữ liệu đầu vào và đầu ra

### 8. API Endpoints
Các API endpoints liên quan

### 9. Error Handling
Xử lý lỗi và các mã lỗi

### 10. Success Criteria
Tiêu chí đánh giá thành công

### 11. Dependencies
Các module và service phụ thuộc

## Cách Sử Dụng

1. **Đọc use case**: Bắt đầu với file README này để hiểu tổng quan
2. **Chọn use case**: Chọn use case phù hợp với vai trò của bạn
3. **Tham khảo chi tiết**: Đọc file use case cụ thể để hiểu rõ quy trình
4. **Implement**: Sử dụng thông tin trong use case để implement tính năng
5. **Test**: Sử dụng success criteria để test tính năng

## Lưu Ý

- Mỗi use case được viết độc lập nhưng có thể liên quan đến nhau
- Các use case được cập nhật thường xuyên theo yêu cầu mới
- Nếu có thay đổi, vui lòng cập nhật cả use case và tài liệu liên quan
- Use cases được viết bằng tiếng Việt để dễ hiểu và sử dụng

## Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ về use cases, vui lòng liên hệ với team phát triển.
