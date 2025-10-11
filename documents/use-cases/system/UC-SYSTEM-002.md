# UC-SYSTEM-002: Tạo Cảnh Báo Tuân Thủ Thấp

## Thông Tin Cơ Bản
- **ID**: UC-SYSTEM-002
- **Tên**: Tạo Cảnh Báo Tuân Thủ Thấp
- **Actor**: System (Hệ thống)
- **Mô tả**: Hệ thống tự động tạo cảnh báo khi bệnh nhân có tỷ lệ tuân thủ thấp
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Hệ thống đang hoạt động bình thường
- Cron job được cấu hình và chạy
- Có bệnh nhân với đơn thuốc đang hoạt động
- Có dữ liệu AdherenceLog để tính toán

## Main Flow
1. **Cron job được kích hoạt**
   - Cron job chạy hàng ngày lúc 9:00 sáng (`@Cron('0 9 * * *')`)
   - Hệ thống bắt đầu quá trình kiểm tra tuân thủ

2. **Hệ thống lấy danh sách bệnh nhân**
   - Hệ thống query database để lấy:
     - Tất cả bệnh nhân có đơn thuốc ACTIVE
     - Bệnh nhân có trạng thái ACTIVE
     - Bệnh nhân có ít nhất một đơn thuốc đang hoạt động

3. **Hệ thống tính toán tỷ lệ tuân thủ**
   - Với mỗi bệnh nhân:
     - Lấy AdherenceLog trong 7 ngày gần nhất
     - Tính tổng số lần uống thuốc
     - Tính số lần đã uống thuốc (status = TAKEN)
     - Tính tỷ lệ tuân thủ = (số lần đã uống / tổng số lần) * 100

4. **Hệ thống kiểm tra điều kiện cảnh báo**
   - Nếu tỷ lệ tuân thủ < 70%:
     - Bệnh nhân được đánh dấu cần cảnh báo
     - Kiểm tra xem đã có cảnh báo LOW_ADHERENCE chưa được resolve chưa
     - Nếu chưa có: Tạo cảnh báo mới
     - Nếu đã có: Bỏ qua để tránh spam

5. **Hệ thống tạo cảnh báo**
   - Tạo Alert record với:
     - **Type**: LOW_ADHERENCE
     - **Patient**: Bệnh nhân có tỷ lệ tuân thủ thấp
     - **Doctor**: Bác sĩ điều trị
     - **Message**: Nội dung cảnh báo chi tiết
     - **Resolved**: false
     - **CreatedAt**: Thời gian tạo cảnh báo

6. **Hệ thống gửi thông báo cho bác sĩ**
   - Gửi thông báo qua WebSocket cho bác sĩ
   - Gửi email cảnh báo cho bác sĩ
   - Thông báo chứa:
     - Tên bệnh nhân
     - Tỷ lệ tuân thủ hiện tại
     - Thời gian kiểm tra
     - Gợi ý hành động

7. **Hệ thống ghi log hoạt động**
   - Ghi log số lượng cảnh báo đã tạo
   - Ghi log các bệnh nhân có tỷ lệ tuân thủ thấp
   - Ghi log các lỗi (nếu có)

8. **Hệ thống cập nhật thống kê**
   - Cập nhật thống kê tỷ lệ tuân thủ tổng quan
   - Cập nhật dashboard cho admin
   - Cập nhật báo cáo cho bác sĩ

## Alternative Flows

### A1: Bệnh nhân không có dữ liệu tuân thủ
- **Trigger**: Bệnh nhân chưa có AdherenceLog nào
- **Action**: Hệ thống bỏ qua bệnh nhân này
- **Return**: Không tạo cảnh báo

### A2: Bệnh nhân có tỷ lệ tuân thủ thấp nhưng đã có cảnh báo
- **Trigger**: Đã có cảnh báo LOW_ADHERENCE trong 24h gần đây
- **Action**: Hệ thống bỏ qua để tránh spam
- **Return**: Không tạo cảnh báo mới

### A3: Bác sĩ không online
- **Trigger**: Bác sĩ không kết nối WebSocket
- **Action**: Hệ thống gửi email cảnh báo
- **Return**: Cảnh báo được gửi qua email

### A4: Lỗi khi tạo cảnh báo
- **Trigger**: Có lỗi khi tạo Alert record
- **Action**: Hệ thống ghi log lỗi và thử lại
- **Return**: Cảnh báo được tạo lại hoặc bỏ qua

## Postconditions
- Cảnh báo LOW_ADHERENCE được tạo cho bệnh nhân có tỷ lệ tuân thủ thấp
- Thông báo được gửi cho bác sĩ
- Log hoạt động được ghi lại
- Thống kê được cập nhật

## Business Rules
1. Cron job chạy hàng ngày lúc 9:00 sáng
2. Tỷ lệ tuân thủ được tính dựa trên 7 ngày gần nhất
3. Ngưỡng cảnh báo là 70% tuân thủ
4. Không tạo cảnh báo trùng lặp trong 24h
5. Cảnh báo được gửi cho bác sĩ điều trị
6. Log tất cả hoạt động để theo dõi

## Data Requirements
### Input Data
- **Thời gian kiểm tra**: currentDate
- **Khoảng thời gian**: 7 ngày gần nhất
- **Ngưỡng cảnh báo**: 70%
- **Thông tin bệnh nhân**: patientId, fullName
- **Thông tin bác sĩ**: doctorId, fullName

### Output Data
- Alert record với type LOW_ADHERENCE
- Thông báo cho bác sĩ
- Log hoạt động
- Thống kê tuân thủ

## API Endpoints
- `POST /notifications/low-adherence-alert` - Tạo cảnh báo tuân thủ thấp
- `GET /notifications/adherence-alerts` - Lấy danh sách cảnh báo tuân thủ
- `PATCH /notifications/alerts/:id/resolve` - Đánh dấu cảnh báo đã xử lý

## Error Handling
- **500 Internal Server Error**: Lỗi hệ thống
- **503 Service Unavailable**: Dịch vụ thông báo không khả dụng
- **Timeout**: Timeout khi tính toán tuân thủ
- **Database Error**: Lỗi database khi query dữ liệu

## Success Criteria
- Cảnh báo được tạo đúng cho bệnh nhân có tỷ lệ tuân thủ thấp
- Bác sĩ nhận được thông báo kịp thời
- Hệ thống hoạt động ổn định hàng ngày
- Log hoạt động đầy đủ và chính xác
- Thống kê được cập nhật chính xác
- Performance tốt với số lượng lớn bệnh nhân

## Dependencies
- Module Notifications
- Module Prescriptions
- Module Users
- Module Reports
- WebSocket Gateway
- Email Service
- Database Service
- Cron Service
