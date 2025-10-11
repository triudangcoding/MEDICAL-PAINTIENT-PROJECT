# UC-PATIENT-002: Xem Lịch Nhắc Uống Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-002
- **Tên**: Xem Lịch Nhắc Uống Thuốc
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân xem lịch nhắc uống thuốc hàng ngày
- **Priority**: High
- **Complexity**: Low

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Bệnh nhân có đơn thuốc đang hoạt động
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân truy cập trang lịch uống thuốc**
   - Bệnh nhân click vào menu "Lịch uống thuốc"
   - Hệ thống hiển thị trang lịch uống thuốc

2. **Hệ thống hiển thị lịch hôm nay**
   - Hệ thống load lịch uống thuốc hôm nay
   - Hiển thị thông tin:
     - **Ngày hiện tại**: Ngày, thứ
     - **Danh sách thuốc**: Thuốc cần uống hôm nay
     - **Thời gian uống**: Các khung giờ cụ thể
     - **Trạng thái**: Đã uống, Chưa uống, Đã bỏ lỡ

3. **Bệnh nhân có thể xem chi tiết từng thuốc**
   - Bệnh nhân click vào thuốc trong danh sách
   - Hệ thống hiển thị modal với thông tin:
     - **Tên thuốc**: Tên đầy đủ và hàm lượng
     - **Liều lượng**: Số lượng thuốc cần uống
     - **Cách uống**: Uống với nước, trước/sau ăn
     - **Lưu ý**: Cảnh báo, tương tác thuốc
     - **Thời gian**: Khung giờ uống thuốc

4. **Bệnh nhân có thể xem lịch theo các khoảng thời gian**

   **4.1. Lịch tuần**
   - Bệnh nhân click vào tab "Tuần này"
   - Hệ thống hiển thị:
     - Lịch uống thuốc 7 ngày trong tuần
     - Tổng số lần uống thuốc trong tuần
     - Tỷ lệ tuân thủ trong tuần
     - Các ngày có thuốc uống

   **4.2. Lịch tháng**
   - Bệnh nhân click vào tab "Tháng này"
   - Hệ thống hiển thị:
     - Lịch uống thuốc trong tháng
     - Biểu đồ tuân thủ theo ngày
     - Thống kê tổng quan tháng
     - Các ngày bỏ lỡ thuốc

   **4.3. Lịch tùy chỉnh**
   - Bệnh nhân chọn khoảng thời gian tùy chỉnh
   - Hệ thống hiển thị lịch uống thuốc trong khoảng thời gian đã chọn

5. **Bệnh nhân có thể xem thống kê tuân thủ**
   - Bệnh nhân click vào tab "Thống kê"
   - Hệ thống hiển thị:
     - **Tỷ lệ tuân thủ**: Phần trăm uống thuốc đúng giờ
     - **Số lần uống**: Tổng số lần đã uống thuốc
     - **Số lần bỏ lỡ**: Số lần bỏ lỡ thuốc
     - **Biểu đồ**: Xu hướng tuân thủ theo thời gian
     - **Đánh giá**: Tốt, Trung bình, Cần cải thiện

6. **Bệnh nhân có thể nhận thông báo nhắc nhở**
   - Hệ thống tự động gửi thông báo nhắc nhở:
     - **Trước 30 phút**: Thông báo sắp đến giờ uống thuốc
     - **Đúng giờ**: Thông báo đến giờ uống thuốc
     - **Sau 30 phút**: Thông báo nhắc nhở nếu chưa uống
   - Bệnh nhân có thể:
     - Xem thông báo trong app
     - Nhận thông báo push (nếu được cấu hình)
     - Nhận email nhắc nhở (nếu được cấu hình)

7. **Bệnh nhân có thể tùy chỉnh lịch**
   - Bệnh nhân click vào tab "Cài đặt"
   - Hệ thống hiển thị các tùy chọn:
     - **Thời gian nhắc nhở**: Trước bao nhiêu phút
     - **Loại thông báo**: Push, Email, SMS
     - **Thời gian im lặng**: Không nhắc nhở trong khoảng thời gian
     - **Ngôn ngữ**: Tiếng Việt, English

## Alternative Flows

### A1: Không có thuốc uống hôm nay
- **Trigger**: Hôm nay không có thuốc nào cần uống
- **Action**: Hệ thống hiển thị thông báo "Hôm nay không có thuốc nào cần uống"
- **Return**: Hiển thị lịch ngày mai hoặc tuần

### A2: Thuốc đã hết hạn
- **Trigger**: Thuốc đã quá ngày kết thúc
- **Action**: Hệ thống hiển thị cảnh báo "Thuốc đã hết hạn"
- **Return**: Hiển thị nút "Liên hệ bác sĩ"

### A3: Thông báo nhắc nhở không hoạt động
- **Trigger**: Thông báo nhắc nhở không được gửi
- **Action**: Hệ thống hiển thị thông báo "Thông báo nhắc nhở tạm thời không khả dụng"
- **Return**: Bệnh nhân có thể xem lịch manual

## Postconditions
- Lịch uống thuốc được hiển thị đầy đủ
- Thông tin thuốc được hiển thị chi tiết
- Thống kê tuân thủ được hiển thị
- Thông báo nhắc nhở được gửi (nếu được cấu hình)
- Cài đặt được lưu (nếu được thay đổi)
- Log truy cập được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể xem lịch uống thuốc
2. Bệnh nhân chỉ có thể xem lịch của mình
3. Lịch uống thuốc dựa trên đơn thuốc đang hoạt động
4. Thông báo nhắc nhở được gửi tự động
5. Thống kê tuân thủ được tính dựa trên AdherenceLog
6. Cài đặt thông báo có thể được tùy chỉnh

## Data Requirements
### Input Data
- **Xem lịch**: patientId, date
- **Tùy chỉnh**: timeRange, notificationSettings
- **Thống kê**: patientId, startDate, endDate

### Output Data
- Lịch uống thuốc hôm nay
- Lịch uống thuốc theo tuần/tháng
- Thống kê tuân thủ
- Thông báo nhắc nhở
- Cài đặt thông báo

## API Endpoints
- `GET /patient/prescriptions/schedule` - Lấy lịch uống thuốc
- `GET /patient/prescriptions/schedule/today` - Lấy lịch hôm nay
- `GET /patient/prescriptions/schedule/week` - Lấy lịch tuần
- `GET /patient/prescriptions/schedule/month` - Lấy lịch tháng
- `GET /patient/prescriptions/adherence-stats` - Lấy thống kê tuân thủ
- `GET /patient/notifications/settings` - Lấy cài đặt thông báo
- `PATCH /patient/notifications/settings` - Cập nhật cài đặt thông báo

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **404 Not Found**: Không có đơn thuốc hoạt động
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Lịch uống thuốc được hiển thị rõ ràng và chính xác
- Thông tin thuốc đầy đủ và dễ hiểu
- Thống kê tuân thủ chính xác và hữu ích
- Thông báo nhắc nhở hoạt động đúng giờ
- Cài đặt thông báo linh hoạt
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Notifications
- Module Users
- Database Service
