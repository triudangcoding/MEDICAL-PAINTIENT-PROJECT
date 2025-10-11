# UC-DOCTOR-004: Giám Sát Tuân Thủ Uống Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-DOCTOR-004
- **Tên**: Giám Sát Tuân Thủ Uống Thuốc
- **Actor**: Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ theo dõi việc tuân thủ uống thuốc của bệnh nhân
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Bác sĩ đã đăng nhập vào hệ thống
- Bác sĩ có quyền DOCTOR
- Bệnh nhân có đơn thuốc đang hoạt động
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bác sĩ truy cập trang giám sát tuân thủ**
   - Bác sĩ click vào menu "Giám sát tuân thủ"
   - Hệ thống hiển thị trang giám sát tuân thủ

2. **Hệ thống hiển thị dashboard tuân thủ**
   - Hệ thống load dashboard với:
     - **Tổng quan**: Số bệnh nhân đang điều trị, Tỷ lệ tuân thủ trung bình
     - **Danh sách bệnh nhân**: Với tỷ lệ tuân thủ và trạng thái
     - **Cảnh báo**: Bệnh nhân có tỷ lệ tuân thủ thấp
     - **Biểu đồ**: Tuân thủ theo thời gian

3. **Bác sĩ có thể xem chi tiết tuân thủ**

   **3.1. Xem tổng quan tuân thủ**
   - Bác sĩ click vào widget "Tỷ lệ tuân thủ trung bình"
   - Hệ thống hiển thị:
     - Biểu đồ tuân thủ theo thời gian (7 ngày, 30 ngày, 90 ngày)
     - Phân bố tuân thủ theo bệnh nhân
     - Top bệnh nhân tuân thủ tốt nhất
     - Danh sách bệnh nhân cần chú ý

   **3.2. Xem chi tiết bệnh nhân**
   - Bác sĩ click vào tên bệnh nhân trong danh sách
   - Hệ thống hiển thị trang chi tiết tuân thủ:
     - **Thông tin bệnh nhân**: Tên, tuổi, đơn thuốc hiện tại
     - **Biểu đồ tuân thủ**: Theo ngày, tuần, tháng
     - **Nhật ký uống thuốc**: Chi tiết từng lần uống
     - **Cảnh báo**: Các cảnh báo liên quan đến tuân thủ

   **3.3. Xem nhật ký uống thuốc**
   - Bác sĩ click vào tab "Nhật ký uống thuốc"
   - Hệ thống hiển thị:
     - Danh sách chi tiết từng lần uống thuốc
     - Thời gian uống (đúng giờ, sớm, muộn)
     - Số lượng thuốc đã uống
     - Ghi chú của bệnh nhân
     - Trạng thái: Đã uống, Bỏ lỡ, Bỏ qua

4. **Bác sĩ có thể thực hiện các thao tác**

   **4.1. Gửi nhắc nhở**
   - Bác sĩ chọn bệnh nhân có tỷ lệ tuân thủ thấp
   - Bác sĩ click nút "Gửi nhắc nhở"
   - Hệ thống hiển thị form nhập nội dung nhắc nhở
   - Bác sĩ nhập nội dung và click "Gửi"
   - Hệ thống gửi thông báo cho bệnh nhân

   **4.2. Xem cảnh báo**
   - Bác sĩ click vào tab "Cảnh báo"
   - Hệ thống hiển thị danh sách cảnh báo:
     - Cảnh báo tuân thủ thấp
     - Cảnh báo bỏ lỡ thuốc nhiều lần
     - Cảnh báo khác
   - Bác sĩ có thể xem chi tiết và đánh dấu đã xử lý

   **4.3. Xuất báo cáo tuân thủ**
   - Bác sĩ click nút "Xuất báo cáo"
   - Hệ thống hiển thị dialog chọn:
     - Bệnh nhân cụ thể hoặc tất cả
     - Khoảng thời gian
     - Format: PDF, Excel
   - Bác sĩ chọn và click "Xuất"
   - Hệ thống tạo file báo cáo và cho phép download

5. **Bác sĩ có thể lọc và tìm kiếm**
   - **Lọc theo thời gian**: 7 ngày, 30 ngày, 90 ngày, tùy chỉnh
   - **Lọc theo tỷ lệ tuân thủ**: Cao (>80%), Trung bình (60-80%), Thấp (<60%)
   - **Tìm kiếm**: Theo tên bệnh nhân
   - **Sắp xếp**: Theo tỷ lệ tuân thủ, theo tên, theo ngày

6. **Hệ thống cập nhật real-time**
   - Dashboard được cập nhật định kỳ (mỗi 5 phút)
   - Cảnh báo được tạo tự động khi phát hiện tuân thủ thấp
   - Thông báo real-time khi có thay đổi

## Alternative Flows

### A1: Bệnh nhân chưa có nhật ký uống thuốc
- **Trigger**: Bệnh nhân chưa có nhật ký uống thuốc nào
- **Action**: Hệ thống hiển thị thông báo "Bệnh nhân chưa có nhật ký uống thuốc"
- **Return**: Hiển thị thông tin đơn thuốc và lịch uống thuốc

### A2: Tỷ lệ tuân thủ thấp
- **Trigger**: Bệnh nhân có tỷ lệ tuân thủ < 70%
- **Action**: Hệ thống tự động tạo cảnh báo và highlight màu đỏ
- **Return**: Hiển thị cảnh báo và gợi ý gửi nhắc nhở

### A3: Bệnh nhân không phản hồi nhắc nhở
- **Trigger**: Bệnh nhân không xác nhận uống thuốc sau nhắc nhở
- **Action**: Hệ thống tạo cảnh báo "Bệnh nhân không phản hồi"
- **Return**: Bác sĩ có thể gửi nhắc nhở khác hoặc liên hệ trực tiếp

## Postconditions
- Dashboard tuân thủ được hiển thị
- Chi tiết tuân thủ của bệnh nhân được hiển thị
- Nhắc nhở được gửi cho bệnh nhân (nếu được yêu cầu)
- Cảnh báo được xử lý (nếu được yêu cầu)
- Báo cáo được xuất (nếu được yêu cầu)
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bác sĩ có quyền DOCTOR mới có thể giám sát tuân thủ
2. Bác sĩ chỉ có thể giám sát bệnh nhân được phân công
3. Tỷ lệ tuân thủ được tính dựa trên AdherenceLog
4. Cảnh báo được tạo tự động khi tỷ lệ tuân thủ < 70%
5. Nhắc nhở phải có nội dung rõ ràng và phù hợp
6. Báo cáo tuân thủ phải chính xác và đầy đủ

## Data Requirements
### Input Data
- **Lọc**: timeRange, adherenceRate, patientName
- **Nhắc nhở**: patientId, message
- **Xuất báo cáo**: patientIds[], startDate, endDate, format

### Output Data
- Dashboard tuân thủ
- Chi tiết tuân thủ bệnh nhân
- Nhật ký uống thuốc
- Danh sách cảnh báo
- Báo cáo tuân thủ
- Thông báo thành công/lỗi

## API Endpoints
- `GET /doctor/adherence/overview` - Lấy tổng quan tuân thủ
- `GET /doctor/adherence/patients` - Lấy danh sách bệnh nhân với tuân thủ
- `GET /doctor/adherence/patients/:id` - Lấy chi tiết tuân thủ bệnh nhân
- `GET /doctor/adherence/patients/:id/logs` - Lấy nhật ký uống thuốc
- `GET /doctor/adherence/alerts` - Lấy danh sách cảnh báo
- `POST /doctor/adherence/patients/:id/reminder` - Gửi nhắc nhở
- `POST /doctor/adherence/export` - Xuất báo cáo tuân thủ

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền DOCTOR
- **403 Forbidden**: Không có quyền giám sát bệnh nhân này
- **404 Not Found**: Bệnh nhân không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Dashboard tuân thủ hiển thị đầy đủ thông tin
- Chi tiết tuân thủ chính xác và dễ hiểu
- Cảnh báo được tạo và hiển thị kịp thời
- Gửi nhắc nhở thành công
- Xuất báo cáo hoạt động tốt
- Giao diện trực quan, dễ sử dụng

## Dependencies
- Module Prescriptions (để lấy đơn thuốc)
- Module Users (để lấy thông tin bệnh nhân)
- Module Notifications (để gửi nhắc nhở)
- Module Reports (để xuất báo cáo)
- Database Service
