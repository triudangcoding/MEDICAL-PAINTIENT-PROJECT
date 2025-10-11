# UC-DOCTOR-005: Xem Lịch Sử Điều Trị

## Thông Tin Cơ Bản
- **ID**: UC-DOCTOR-005
- **Tên**: Xem Lịch Sử Điều Trị
- **Actor**: Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ xem lịch sử điều trị của bệnh nhân
- **Priority**: Medium
- **Complexity**: Medium

## Preconditions
- Bác sĩ đã đăng nhập vào hệ thống
- Bác sĩ có quyền DOCTOR
- Bệnh nhân đã có lịch sử điều trị
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bác sĩ truy cập lịch sử điều trị**
   - Bác sĩ click vào menu "Lịch sử điều trị" hoặc từ trang quản lý bệnh nhân
   - Hệ thống hiển thị trang lịch sử điều trị

2. **Bác sĩ chọn bệnh nhân**
   - Nếu từ trang quản lý bệnh nhân: Bệnh nhân đã được chọn
   - Nếu từ menu: Bác sĩ chọn bệnh nhân từ dropdown
   - Hệ thống hiển thị thông tin bệnh nhân đã chọn

3. **Hệ thống hiển thị lịch sử điều trị**
   - Hệ thống load lịch sử điều trị với:
     - **Thông tin bệnh nhân**: Tên, tuổi, giới tính, hồ sơ bệnh án
     - **Timeline điều trị**: Các đơn thuốc theo thời gian
     - **Tổng quan**: Số đơn thuốc, thời gian điều trị, tỷ lệ tuân thủ

4. **Bác sĩ có thể xem chi tiết từng đơn thuốc**

   **4.1. Xem đơn thuốc cũ**
   - Bác sĩ click vào đơn thuốc trong timeline
   - Hệ thống hiển thị modal với thông tin:
     - Thông tin đơn thuốc: Ngày tạo, trạng thái, ghi chú
     - Danh sách thuốc: Tên, liều lượng, tần suất
     - Lịch uống thuốc: Thời gian uống trong ngày
     - Nhật ký tuân thủ: Lịch sử uống thuốc

   **4.2. So sánh đơn thuốc**
   - Bác sĩ chọn 2 đơn thuốc để so sánh
   - Hệ thống hiển thị bảng so sánh:
     - Thuốc giống nhau và khác nhau
     - Thay đổi về liều lượng
     - Thay đổi về tần suất uống
     - Thay đổi về thời gian điều trị

5. **Bác sĩ có thể xem các báo cáo**

   **5.1. Báo cáo tuân thủ theo thời gian**
   - Bác sĩ click vào tab "Tuân thủ theo thời gian"
   - Hệ thống hiển thị:
     - Biểu đồ tuân thủ theo từng đơn thuốc
     - Xu hướng tuân thủ theo thời gian
     - So sánh tuân thủ giữa các đơn thuốc
     - Phân tích nguyên nhân tuân thủ thấp

   **5.2. Báo cáo hiệu quả điều trị**
   - Bác sĩ click vào tab "Hiệu quả điều trị"
   - Hệ thống hiển thị:
     - Thời gian hoàn thành điều trị
     - Tỷ lệ thành công của từng đơn thuốc
     - Thuốc hiệu quả nhất
     - Phân tích xu hướng điều trị

   **5.3. Báo cáo tương tác thuốc**
   - Bác sĩ click vào tab "Tương tác thuốc"
   - Hệ thống hiển thị:
     - Các thuốc đã sử dụng cùng lúc
     - Cảnh báo tương tác đã phát hiện
     - Khuyến nghị điều chỉnh thuốc
     - Lịch sử thay đổi thuốc

6. **Bác sĩ có thể thực hiện các thao tác**

   **6.1. Xuất báo cáo lịch sử**
   - Bác sĩ click nút "Xuất báo cáo"
   - Hệ thống hiển thị dialog chọn:
     - Khoảng thời gian
     - Loại báo cáo: Tổng quan, Chi tiết, So sánh
     - Format: PDF, Excel
   - Bác sĩ chọn và click "Xuất"

   **6.2. Tạo đơn thuốc mới dựa trên lịch sử**
   - Bác sĩ click nút "Tạo đơn thuốc mới"
   - Hệ thống chuyển đến trang tạo đơn thuốc với:
     - Thông tin bệnh nhân đã điền sẵn
     - Gợi ý thuốc dựa trên lịch sử
     - Cảnh báo thuốc đã gây dị ứng
     - Thông tin tuân thủ trước đó

   **6.3. Thêm ghi chú điều trị**
   - Bác sĩ click nút "Thêm ghi chú"
   - Hệ thống hiển thị form nhập ghi chú
   - Bác sĩ nhập ghi chú và click "Lưu"
   - Ghi chú được lưu vào lịch sử điều trị

7. **Bác sĩ có thể lọc và tìm kiếm**
   - **Lọc theo thời gian**: Năm, tháng, khoảng thời gian tùy chỉnh
   - **Lọc theo trạng thái**: ACTIVE, COMPLETED, CANCELLED
   - **Tìm kiếm**: Theo tên thuốc, ghi chú
   - **Sắp xếp**: Theo thời gian, theo trạng thái

## Alternative Flows

### A1: Bệnh nhân chưa có lịch sử điều trị
- **Trigger**: Bệnh nhân chưa có đơn thuốc nào
- **Action**: Hệ thống hiển thị thông báo "Bệnh nhân chưa có lịch sử điều trị"
- **Return**: Hiển thị nút "Tạo đơn thuốc đầu tiên"

### A2: Đơn thuốc bị hủy
- **Trigger**: Đơn thuốc có trạng thái CANCELLED
- **Action**: Hệ thống hiển thị đơn thuốc với màu xám và ghi chú "Đã hủy"
- **Return**: Bác sĩ có thể xem lý do hủy

### A3: Thuốc đã gây dị ứng
- **Trigger**: Thuốc trong lịch sử đã gây dị ứng
- **Action**: Hệ thống hiển thị cảnh báo đỏ "Thuốc đã gây dị ứng"
- **Return**: Bác sĩ được cảnh báo khi tạo đơn thuốc mới

## Postconditions
- Lịch sử điều trị được hiển thị đầy đủ
- Chi tiết đơn thuốc được hiển thị (nếu được yêu cầu)
- Báo cáo được xuất (nếu được yêu cầu)
- Ghi chú được thêm vào lịch sử (nếu được yêu cầu)
- Log truy cập được ghi lại

## Business Rules
1. Chỉ bác sĩ có quyền DOCTOR mới có thể xem lịch sử điều trị
2. Bác sĩ chỉ có thể xem lịch sử bệnh nhân được phân công
3. Lịch sử điều trị không thể chỉnh sửa
4. Ghi chú điều trị có thể được thêm bởi bác sĩ
5. Báo cáo phải chính xác và đầy đủ
6. Thông tin bệnh nhân phải được bảo mật

## Data Requirements
### Input Data
- **Chọn bệnh nhân**: patientId
- **Lọc**: startDate, endDate, status, medicationName
- **Ghi chú**: patientId, note
- **Xuất báo cáo**: patientId, startDate, endDate, reportType, format

### Output Data
- Lịch sử điều trị
- Chi tiết đơn thuốc
- Báo cáo tuân thủ
- Báo cáo hiệu quả điều trị
- Báo cáo tương tác thuốc
- File báo cáo đã xuất

## API Endpoints
- `GET /doctor/patients/:id/treatment-history` - Lấy lịch sử điều trị
- `GET /doctor/patients/:id/prescriptions` - Lấy danh sách đơn thuốc
- `GET /doctor/patients/:id/prescriptions/:prescriptionId` - Lấy chi tiết đơn thuốc
- `GET /doctor/patients/:id/adherence-trend` - Lấy xu hướng tuân thủ
- `GET /doctor/patients/:id/medication-interactions` - Lấy tương tác thuốc
- `POST /doctor/patients/:id/treatment-notes` - Thêm ghi chú điều trị
- `POST /doctor/patients/:id/export-history` - Xuất báo cáo lịch sử

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền DOCTOR
- **403 Forbidden**: Không có quyền xem lịch sử bệnh nhân này
- **404 Not Found**: Bệnh nhân không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Lịch sử điều trị được hiển thị đầy đủ và chính xác
- Chi tiết đơn thuốc dễ xem và hiểu
- Báo cáo được tạo chính xác
- So sánh đơn thuốc hoạt động tốt
- Xuất báo cáo thành công
- Giao diện trực quan, dễ sử dụng

## Dependencies
- Module Prescriptions (để lấy đơn thuốc)
- Module Users (để lấy thông tin bệnh nhân)
- Module Medications (để lấy thông tin thuốc)
- Module Reports (để xuất báo cáo)
- Database Service
