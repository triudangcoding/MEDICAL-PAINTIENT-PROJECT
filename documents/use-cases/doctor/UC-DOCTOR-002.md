# UC-DOCTOR-002: Kê Đơn Thuốc Điện Tử

## Thông Tin Cơ Bản
- **ID**: UC-DOCTOR-002
- **Tên**: Kê Đơn Thuốc Điện Tử
- **Actor**: Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ tạo đơn thuốc điện tử cho bệnh nhân
- **Priority**: High
- **Complexity**: High

## Preconditions
- Bác sĩ đã đăng nhập vào hệ thống
- Bác sĩ có quyền DOCTOR
- Bệnh nhân đã được phân công cho bác sĩ
- Danh mục thuốc có sẵn trong hệ thống
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bác sĩ truy cập trang tạo đơn thuốc**
   - Bác sĩ click vào menu "Tạo đơn thuốc" hoặc từ trang quản lý bệnh nhân
   - Hệ thống hiển thị trang tạo đơn thuốc

2. **Bác sĩ chọn bệnh nhân**
   - Nếu từ trang quản lý bệnh nhân: Thông tin bệnh nhân đã được điền sẵn
   - Nếu từ menu: Bác sĩ chọn bệnh nhân từ dropdown
   - Hệ thống hiển thị thông tin bệnh nhân đã chọn:
     - Tên, tuổi, giới tính
     - Hồ sơ bệnh án (dị ứng, tiền sử bệnh)
     - Thuốc đang dùng
     - Đơn thuốc gần nhất (nếu có)

3. **Bác sĩ thêm thuốc vào đơn**
   - Bác sĩ click nút "Thêm thuốc"
   - Hệ thống hiển thị modal chọn thuốc với:
     - Danh mục thuốc có thể tìm kiếm
     - Thông tin thuốc: Tên, hàm lượng, dạng bào chế
     - Cảnh báo tương tác thuốc (nếu có)
   - Bác sĩ chọn thuốc và click "Thêm"

4. **Bác sĩ nhập thông tin thuốc**
   - Hệ thống hiển thị form nhập thông tin thuốc:
     - **Liều lượng**: Số lượng thuốc mỗi lần uống
     - **Tần suất**: Số lần uống trong ngày
     - **Thời gian uống**: Chọn các khung giờ (sáng, trưa, chiều, tối)
     - **Thời gian điều trị**: Số ngày uống thuốc
     - **Đường dùng**: Uống, tiêm, bôi, etc.
     - **Hướng dẫn**: Ghi chú đặc biệt cho bệnh nhân
   - Bác sĩ nhập thông tin và click "Lưu"

5. **Bác sĩ có thể thêm nhiều thuốc**
   - Bác sĩ có thể thêm nhiều thuốc vào đơn
   - Hệ thống hiển thị danh sách thuốc đã thêm
   - Bác sĩ có thể chỉnh sửa hoặc xóa thuốc đã thêm

6. **Bác sĩ nhập thông tin đơn thuốc**
   - Bác sĩ nhập:
     - **Ghi chú đơn thuốc**: Chẩn đoán, hướng dẫn điều trị
     - **Ngày bắt đầu**: Ngày bắt đầu uống thuốc (mặc định hôm nay)
     - **Ngày kết thúc**: Ngày kết thúc điều trị (tự động tính hoặc nhập thủ công)
     - **Lưu ý đặc biệt**: Cảnh báo, tương tác thuốc

7. **Bác sĩ xem lại và xác nhận đơn thuốc**
   - Hệ thống hiển thị tổng quan đơn thuốc:
     - Thông tin bệnh nhân
     - Danh sách thuốc với đầy đủ thông tin
     - Lịch uống thuốc hàng ngày
     - Tổng thời gian điều trị
   - Bác sĩ xem lại và click "Xác nhận tạo đơn"

8. **Hệ thống tạo đơn thuốc**
   - Hệ thống validate dữ liệu
   - Hệ thống tạo đơn thuốc với trạng thái ACTIVE
   - Hệ thống tạo các PrescriptionItem cho từng thuốc
   - Hệ thống gửi thông báo cho bệnh nhân
   - Hệ thống hiển thị thông báo thành công

## Alternative Flows

### A1: Bệnh nhân có dị ứng với thuốc được chọn
- **Trigger**: Bác sĩ chọn thuốc mà bệnh nhân bị dị ứng
- **Action**: Hệ thống hiển thị cảnh báo đỏ "Bệnh nhân có dị ứng với thuốc này"
- **Return**: Bác sĩ có thể chọn thuốc khác hoặc xác nhận vẫn sử dụng

### A2: Thuốc có tương tác với thuốc đang dùng
- **Trigger**: Thuốc mới có tương tác với thuốc bệnh nhân đang dùng
- **Action**: Hệ thống hiển thị cảnh báo vàng "Có tương tác thuốc"
- **Return**: Bác sĩ có thể điều chỉnh liều lượng hoặc chọn thuốc khác

### A3: Liều lượng không hợp lý
- **Trigger**: Bác sĩ nhập liều lượng quá cao hoặc quá thấp
- **Action**: Hệ thống hiển thị cảnh báo "Liều lượng không trong phạm vi khuyến nghị"
- **Return**: Bác sĩ có thể điều chỉnh hoặc xác nhận vẫn sử dụng

### A4: Thời gian uống thuốc không hợp lý
- **Trigger**: Bác sĩ chọn thời gian uống thuốc không phù hợp
- **Action**: Hệ thống hiển thị gợi ý "Nên uống thuốc sau bữa ăn"
- **Return**: Bác sĩ có thể điều chỉnh hoặc giữ nguyên

## Postconditions
- Đơn thuốc điện tử được tạo thành công
- Các PrescriptionItem được tạo cho từng thuốc
- Thông báo được gửi cho bệnh nhân
- Lịch nhắc uống thuốc được thiết lập
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bác sĩ có quyền DOCTOR mới có thể kê đơn thuốc
2. Bác sĩ chỉ có thể kê đơn cho bệnh nhân được phân công
3. Đơn thuốc phải có ít nhất một thuốc
4. Liều lượng và tần suất phải hợp lý
5. Thời gian điều trị không được quá 1 năm
6. Thuốc được chọn phải còn hoạt động trong hệ thống
7. Phải có ghi chú đơn thuốc

## Data Requirements
### Input Data
- **Thông tin đơn thuốc**: patientId, notes, startDate, endDate
- **Thông tin thuốc**: medicationId, dosage, frequencyPerDay, timesOfDay[], durationDays, route, instructions
- **Xác nhận**: confirm

### Output Data
- Đơn thuốc đã tạo với ID
- Danh sách PrescriptionItem
- Thông báo thành công
- Lịch uống thuốc cho bệnh nhân

## API Endpoints
- `POST /doctor/prescriptions` - Tạo đơn thuốc mới
- `GET /doctor/patients/:id/medical-history` - Lấy hồ sơ bệnh án
- `GET /medications` - Lấy danh mục thuốc
- `POST /doctor/prescriptions/:id/validate` - Validate đơn thuốc
- `GET /doctor/prescriptions/:id/preview` - Xem trước đơn thuốc

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền DOCTOR
- **403 Forbidden**: Không có quyền kê đơn cho bệnh nhân này
- **404 Not Found**: Bệnh nhân hoặc thuốc không tồn tại
- **422 Unprocessable Entity**: Đơn thuốc không hợp lệ
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Bác sĩ có thể tạo đơn thuốc điện tử thành công
- Hệ thống validate dữ liệu chính xác
- Cảnh báo tương tác thuốc hoạt động tốt
- Thông báo được gửi cho bệnh nhân
- Giao diện thân thiện, dễ sử dụng
- Performance tốt khi tìm kiếm thuốc

## Dependencies
- Module Prescriptions
- Module Users (để lấy thông tin bệnh nhân)
- Module Medications (để lấy danh mục thuốc)
- Module Notifications (để gửi thông báo)
- Database Service
- Validation Service
