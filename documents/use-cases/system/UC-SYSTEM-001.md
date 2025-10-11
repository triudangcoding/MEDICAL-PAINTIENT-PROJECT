# UC-SYSTEM-001: Gửi Nhắc Nhở Uống Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-SYSTEM-001
- **Tên**: Gửi Nhắc Nhở Uống Thuốc
- **Actor**: System (Hệ thống)
- **Mô tả**: Hệ thống tự động gửi nhắc nhở uống thuốc cho bệnh nhân
- **Priority**: High
- **Complexity**: High

## Preconditions
- Hệ thống đang hoạt động bình thường
- Cron job được cấu hình và chạy
- Có bệnh nhân với đơn thuốc đang hoạt động
- Hệ thống thông báo hoạt động bình thường

## Main Flow
1. **Cron job được kích hoạt**
   - Cron job chạy mỗi phút (`@Cron(CronExpression.EVERY_MINUTE)`)
   - Hệ thống bắt đầu quá trình kiểm tra nhắc nhở

2. **Hệ thống kiểm tra thời gian hiện tại**
   - Hệ thống lấy thời gian hiện tại
   - Tính toán các khung giờ uống thuốc sắp tới
   - Xác định bệnh nhân cần nhắc nhở

3. **Hệ thống tìm bệnh nhân cần nhắc nhở**
   - Hệ thống query database để tìm:
     - Bệnh nhân có đơn thuốc ACTIVE
     - Thuốc có thời gian uống trong khoảng thời gian sắp tới
     - Bệnh nhân chưa xác nhận uống thuốc
   - Lọc ra danh sách bệnh nhân cần nhắc nhở

4. **Hệ thống tạo thông báo nhắc nhở**
   - Với mỗi bệnh nhân cần nhắc nhở:
     - Tạo nội dung thông báo
     - Xác định loại thông báo (sắp uống, đến giờ, muộn)
     - Tạo Alert record trong database
     - Chuẩn bị dữ liệu gửi thông báo

5. **Hệ thống gửi thông báo**

   **5.1. Gửi thông báo WebSocket**
   - Hệ thống gửi thông báo real-time qua WebSocket
   - Bệnh nhân nhận thông báo ngay lập tức
   - Thông báo hiển thị trong app

   **5.2. Gửi thông báo Push**
   - Hệ thống gửi push notification (nếu được cấu hình)
   - Bệnh nhân nhận thông báo trên điện thoại
   - Thông báo hiển thị ngay cả khi app không mở

   **5.3. Gửi thông báo Email**
   - Hệ thống gửi email nhắc nhở (nếu được cấu hình)
   - Email được gửi đến địa chỉ email của bệnh nhân
   - Email chứa thông tin chi tiết về thuốc cần uống

6. **Hệ thống ghi log hoạt động**
   - Hệ thống ghi log số lượng thông báo đã gửi
   - Ghi log các lỗi (nếu có)
   - Cập nhật trạng thái Alert trong database

7. **Hệ thống xử lý phản hồi**
   - Hệ thống theo dõi phản hồi từ bệnh nhân
   - Cập nhật trạng thái Alert khi bệnh nhân xác nhận
   - Tạo cảnh báo nếu bệnh nhân không phản hồi

## Alternative Flows

### A1: Bệnh nhân không online
- **Trigger**: Bệnh nhân không kết nối WebSocket
- **Action**: Hệ thống gửi push notification và email
- **Return**: Thông báo được gửi qua các kênh khác

### A2: Lỗi gửi thông báo
- **Trigger**: Có lỗi khi gửi thông báo
- **Action**: Hệ thống ghi log lỗi và thử lại
- **Return**: Thông báo được gửi lại hoặc bỏ qua

### A3: Bệnh nhân đã uống thuốc
- **Trigger**: Bệnh nhân đã xác nhận uống thuốc trước khi nhắc nhở
- **Action**: Hệ thống bỏ qua việc gửi nhắc nhở
- **Return**: Không gửi thông báo

### A4: Thuốc đã hết hạn
- **Trigger**: Thuốc đã quá ngày kết thúc
- **Action**: Hệ thống không gửi nhắc nhở
- **Return**: Tạo cảnh báo cho bác sĩ

## Postconditions
- Thông báo nhắc nhở được gửi cho bệnh nhân
- Alert record được tạo trong database
- Log hoạt động được ghi lại
- Trạng thái thông báo được cập nhật

## Business Rules
1. Cron job chạy mỗi phút để đảm bảo nhắc nhở kịp thời
2. Chỉ gửi nhắc nhở cho bệnh nhân có đơn thuốc ACTIVE
3. Không gửi nhắc nhở cho thuốc đã hết hạn
4. Thông báo được gửi qua nhiều kênh để đảm bảo bệnh nhân nhận được
5. Log tất cả hoạt động để theo dõi và debug
6. Xử lý lỗi gracefully để không ảnh hưởng đến hệ thống

## Data Requirements
### Input Data
- **Thời gian hiện tại**: currentTime
- **Khung giờ uống thuốc**: timesOfDay[]
- **Thông tin bệnh nhân**: patientId, phoneNumber, email
- **Thông tin thuốc**: medicationName, dosage, prescriptionId

### Output Data
- Alert record trong database
- Thông báo WebSocket
- Push notification
- Email nhắc nhở
- Log hoạt động

## API Endpoints
- `POST /notifications/medication-reminder` - Gửi nhắc nhở uống thuốc
- `GET /notifications/reminder-logs` - Lấy log nhắc nhở
- `PATCH /notifications/alerts/:id/status` - Cập nhật trạng thái Alert

## Error Handling
- **500 Internal Server Error**: Lỗi hệ thống
- **503 Service Unavailable**: Dịch vụ thông báo không khả dụng
- **Timeout**: Timeout khi gửi thông báo
- **Network Error**: Lỗi mạng khi gửi thông báo

## Success Criteria
- Thông báo nhắc nhở được gửi đúng giờ
- Bệnh nhân nhận được thông báo qua nhiều kênh
- Hệ thống hoạt động ổn định 24/7
- Log hoạt động đầy đủ và chính xác
- Xử lý lỗi hiệu quả
- Performance tốt với số lượng lớn bệnh nhân

## Dependencies
- Module Notifications
- Module Prescriptions
- Module Users
- WebSocket Gateway
- Email Service
- Push Notification Service
- Database Service
- Cron Service
