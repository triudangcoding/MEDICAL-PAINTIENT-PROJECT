# UC-PATIENT-001: Xem Đơn Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-001
- **Tên**: Xem Đơn Thuốc
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân xem đơn thuốc hiện tại của mình
- **Priority**: High
- **Complexity**: Low

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Bệnh nhân có ít nhất một đơn thuốc
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân truy cập trang đơn thuốc**
   - Bệnh nhân click vào menu "Đơn thuốc của tôi"
   - Hệ thống hiển thị trang đơn thuốc

2. **Hệ thống hiển thị đơn thuốc đang hoạt động**
   - Hệ thống load đơn thuốc có trạng thái ACTIVE
   - Hiển thị thông tin đơn thuốc:
     - **Thông tin đơn thuốc**: Mã đơn, Bác sĩ kê đơn, Ngày tạo, Ngày kết thúc
     - **Ghi chú từ bác sĩ**: Chẩn đoán, hướng dẫn điều trị
     - **Trạng thái**: Đang điều trị, Sắp kết thúc, Đã kết thúc

3. **Bệnh nhân có thể xem chi tiết đơn thuốc**
   - Bệnh nhân click vào đơn thuốc
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - **Danh sách thuốc**: Tên thuốc, hàm lượng, dạng bào chế
     - **Liều lượng**: Số lượng thuốc mỗi lần uống
     - **Tần suất**: Số lần uống trong ngày
     - **Thời gian uống**: Các khung giờ cụ thể (VD: 8:00, 14:00, 20:00)
     - **Thời gian điều trị**: Số ngày uống thuốc
     - **Hướng dẫn**: Cách uống thuốc, lưu ý đặc biệt

4. **Bệnh nhân có thể xem lịch uống thuốc**
   - Bệnh nhân click vào tab "Lịch uống thuốc"
   - Hệ thống hiển thị:
     - **Lịch hôm nay**: Thuốc cần uống hôm nay với thời gian cụ thể
     - **Lịch tuần**: Lịch uống thuốc trong tuần
     - **Lịch tháng**: Lịch uống thuốc trong tháng
     - **Trạng thái**: Đã uống, Chưa uống, Đã bỏ lỡ

5. **Bệnh nhân có thể xem thông tin bác sĩ**
   - Bệnh nhân click vào tên bác sĩ
   - Hệ thống hiển thị thông tin bác sĩ:
     - Tên bác sĩ
     - Chuyên khoa
     - Số điện thoại (nếu được phép)
     - Thời gian làm việc

6. **Bệnh nhân có thể xem lịch sử đơn thuốc**
   - Bệnh nhân click vào tab "Lịch sử đơn thuốc"
   - Hệ thống hiển thị:
     - Danh sách đơn thuốc đã hoàn thành
     - Đơn thuốc đã hủy
     - Thời gian điều trị
     - Kết quả điều trị

## Alternative Flows

### A1: Bệnh nhân chưa có đơn thuốc
- **Trigger**: Bệnh nhân chưa có đơn thuốc nào
- **Action**: Hệ thống hiển thị thông báo "Bạn chưa có đơn thuốc nào"
- **Return**: Hiển thị nút "Liên hệ bác sĩ"

### A2: Đơn thuốc đã hết hạn
- **Trigger**: Đơn thuốc đã quá ngày kết thúc
- **Action**: Hệ thống hiển thị cảnh báo "Đơn thuốc đã hết hạn"
- **Return**: Hiển thị nút "Liên hệ bác sĩ để tái khám"

### A3: Đơn thuốc bị hủy
- **Trigger**: Đơn thuốc có trạng thái CANCELLED
- **Action**: Hệ thống hiển thị thông báo "Đơn thuốc đã bị hủy"
- **Return**: Hiển thị lý do hủy và nút "Liên hệ bác sĩ"

## Postconditions
- Đơn thuốc được hiển thị đầy đủ thông tin
- Lịch uống thuốc được hiển thị rõ ràng
- Thông tin bác sĩ được hiển thị (nếu được yêu cầu)
- Lịch sử đơn thuốc được hiển thị (nếu được yêu cầu)
- Log truy cập được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể xem đơn thuốc
2. Bệnh nhân chỉ có thể xem đơn thuốc của mình
3. Đơn thuốc phải có trạng thái ACTIVE để hiển thị
4. Thông tin bác sĩ chỉ hiển thị nếu được phép
5. Lịch sử đơn thuốc không thể chỉnh sửa
6. Đơn thuốc hết hạn vẫn có thể xem nhưng có cảnh báo

## Data Requirements
### Input Data
- **Xem đơn thuốc**: patientId
- **Xem chi tiết**: prescriptionId
- **Xem lịch sử**: patientId, timeRange

### Output Data
- Đơn thuốc đang hoạt động
- Chi tiết đơn thuốc
- Lịch uống thuốc
- Thông tin bác sĩ
- Lịch sử đơn thuốc
- Thông báo/cảnh báo

## API Endpoints
- `GET /patient/prescriptions` - Lấy đơn thuốc của bệnh nhân
- `GET /patient/prescriptions/:id` - Lấy chi tiết đơn thuốc
- `GET /patient/prescriptions/schedule` - Lấy lịch uống thuốc
- `GET /patient/prescriptions/history` - Lấy lịch sử đơn thuốc
- `GET /patient/doctors/:id` - Lấy thông tin bác sĩ

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **404 Not Found**: Đơn thuốc không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Đơn thuốc được hiển thị rõ ràng và dễ hiểu
- Lịch uống thuốc chính xác và dễ theo dõi
- Thông tin bác sĩ đầy đủ và hữu ích
- Lịch sử đơn thuốc được hiển thị đầy đủ
- Giao diện thân thiện, dễ sử dụng
- Performance tốt khi load dữ liệu

## Dependencies
- Module Prescriptions
- Module Users (để lấy thông tin bác sĩ)
- Module Medications (để lấy thông tin thuốc)
- Database Service
