# UC-ADMIN-004: Xem Báo Cáo Tổng Quan

## Thông Tin Cơ Bản
- **ID**: UC-ADMIN-004
- **Tên**: Xem Báo Cáo Tổng Quan
- **Actor**: Admin (Quản trị viên)
- **Mô tả**: Admin xem các báo cáo thống kê tổng quan hệ thống
- **Priority**: Medium
- **Complexity**: Medium

## Preconditions
- Admin đã đăng nhập vào hệ thống
- Admin có quyền ADMIN
- Hệ thống đang hoạt động bình thường
- Có dữ liệu trong hệ thống để tạo báo cáo

## Main Flow
1. **Admin truy cập trang báo cáo**
   - Admin click vào menu "Báo cáo tổng quan"
   - Hệ thống hiển thị trang báo cáo

2. **Hệ thống hiển thị dashboard tổng quan**
   - Hệ thống load các widget thống kê:
     - **Tổng số đơn thuốc**: Hiển thị số lượng đơn thuốc trong hệ thống
     - **Số bệnh nhân đang điều trị**: Số bệnh nhân có đơn thuốc ACTIVE
     - **Tỷ lệ tuân thủ**: Tỷ lệ phần trăm bệnh nhân uống thuốc đúng giờ
     - **Số bác sĩ hoạt động**: Số bác sĩ đang có bệnh nhân điều trị
     - **Thuốc được kê nhiều nhất**: Top 5 thuốc được sử dụng nhiều nhất
     - **Chuyên khoa phổ biến**: Thống kê theo chuyên khoa

3. **Admin có thể xem các báo cáo chi tiết:**

   **3.1. Báo cáo đơn thuốc**
   - Admin click vào widget "Tổng số đơn thuốc"
   - Hệ thống hiển thị:
     - Biểu đồ đơn thuốc theo thời gian (tuần/tháng)
     - Phân bố đơn thuốc theo trạng thái
     - Top bác sĩ kê đơn nhiều nhất
     - Thống kê đơn thuốc theo chuyên khoa

   **3.2. Báo cáo tuân thủ**
   - Admin click vào widget "Tỷ lệ tuân thủ"
   - Hệ thống hiển thị:
     - Biểu đồ tuân thủ theo thời gian
     - Phân bố tuân thủ theo bệnh nhân
     - Danh sách bệnh nhân có tỷ lệ tuân thủ thấp
     - Thống kê tuân thủ theo thuốc

   **3.3. Báo cáo bệnh nhân**
   - Admin click vào widget "Số bệnh nhân đang điều trị"
   - Hệ thống hiển thị:
     - Biểu đồ số lượng bệnh nhân theo thời gian
     - Phân bố bệnh nhân theo độ tuổi
     - Phân bố bệnh nhân theo giới tính
     - Thống kê bệnh nhân theo chuyên khoa

   **3.4. Báo cáo bác sĩ**
   - Admin click vào widget "Số bác sĩ hoạt động"
   - Hệ thống hiển thị:
     - Danh sách bác sĩ và số lượng bệnh nhân
     - Thống kê bác sĩ theo chuyên khoa
     - Hiệu suất làm việc của từng bác sĩ
     - Lịch sử hoạt động của bác sĩ

4. **Admin có thể tùy chỉnh báo cáo:**

   **4.1. Chọn khoảng thời gian**
   - Admin chọn từ ngày - đến ngày
   - Hệ thống cập nhật dữ liệu theo khoảng thời gian đã chọn
   - Hiển thị lại các widget với dữ liệu mới

   **4.2. Lọc theo chuyên khoa**
   - Admin chọn chuyên khoa cụ thể
   - Hệ thống lọc dữ liệu theo chuyên khoa
   - Hiển thị báo cáo đã được lọc

   **4.3. Xuất báo cáo**
   - Admin click nút "Xuất báo cáo"
   - Hệ thống hiển thị dialog chọn format: PDF, Excel, CSV
   - Admin chọn format và click "Xuất"
   - Hệ thống tạo file báo cáo và cho phép download

5. **Hệ thống cập nhật dữ liệu real-time**
   - Các widget được cập nhật định kỳ (mỗi 5 phút)
   - Hiển thị thời gian cập nhật cuối cùng
   - Cho phép refresh manual

## Alternative Flows

### A1: Không có dữ liệu để tạo báo cáo
- **Trigger**: Hệ thống chưa có dữ liệu đơn thuốc hoặc bệnh nhân
- **Action**: Hệ thống hiển thị thông báo "Chưa có dữ liệu để tạo báo cáo"
- **Return**: Hiển thị dashboard trống với thông báo

### A2: Lỗi khi tính toán thống kê
- **Trigger**: Có lỗi trong quá trình tính toán dữ liệu
- **Action**: Hệ thống hiển thị thông báo lỗi và cho phép thử lại
- **Return**: Hiển thị widget với dữ liệu cũ hoặc trống

### A3: Xuất báo cáo với dữ liệu lớn
- **Trigger**: Dữ liệu báo cáo quá lớn để xuất ngay
- **Action**: Hệ thống tạo job xuất báo cáo và gửi email khi hoàn thành
- **Return**: Hiển thị thông báo "Báo cáo đang được tạo, sẽ gửi email khi hoàn thành"

## Postconditions
- Dashboard được hiển thị với dữ liệu thống kê
- Các widget được cập nhật theo thời gian thực
- Báo cáo chi tiết được hiển thị (nếu được yêu cầu)
- File báo cáo được xuất (nếu được yêu cầu)
- Log truy cập báo cáo được ghi lại

## Business Rules
1. Chỉ ADMIN mới có quyền xem báo cáo tổng quan
2. Dữ liệu báo cáo được tính toán real-time
3. Tỷ lệ tuân thủ được tính dựa trên AdherenceLog
4. Bệnh nhân đang điều trị là những người có đơn thuốc ACTIVE
5. Thống kê được cập nhật định kỳ mỗi 5 phút
6. File báo cáo được lưu trữ trong 30 ngày

## Data Requirements
### Input Data
- **Khoảng thời gian**: startDate, endDate
- **Bộ lọc**: majorDoctorId, status
- **Format xuất**: pdf, excel, csv

### Output Data
- Dashboard với các widget thống kê
- Báo cáo chi tiết theo từng module
- File báo cáo đã xuất
- Thông báo thành công/lỗi

## API Endpoints
- `GET /reports/overview` - Lấy dashboard tổng quan
- `GET /reports/prescriptions` - Báo cáo đơn thuốc
- `GET /reports/adherence` - Báo cáo tuân thủ
- `GET /reports/patients` - Báo cáo bệnh nhân
- `GET /reports/doctors` - Báo cáo bác sĩ
- `POST /reports/export` - Xuất báo cáo
- `GET /reports/download/:fileId` - Download file báo cáo

## Error Handling
- **400 Bad Request**: Khoảng thời gian không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền ADMIN
- **500 Internal Server Error**: Lỗi tính toán thống kê
- **503 Service Unavailable**: Dịch vụ xuất báo cáo không khả dụng

## Success Criteria
- Dashboard hiển thị đầy đủ thông tin thống kê
- Dữ liệu được cập nhật real-time
- Báo cáo chi tiết chính xác và đầy đủ
- Xuất báo cáo hoạt động tốt
- Giao diện trực quan, dễ hiểu
- Performance tốt với dữ liệu lớn

## Dependencies
- Module Reports
- Module Prescriptions (để lấy dữ liệu đơn thuốc)
- Module Users (để lấy dữ liệu bác sĩ, bệnh nhân)
- Module Medications (để thống kê thuốc)
- Database Service
- Export Service (PDF, Excel, CSV)
