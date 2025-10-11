# UC-DOCTOR-003: Chỉnh Sửa Đơn Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-DOCTOR-003
- **Tên**: Chỉnh Sửa Đơn Thuốc
- **Actor**: Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ cập nhật đơn thuốc khi cần thiết
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Bác sĩ đã đăng nhập vào hệ thống
- Bác sĩ có quyền DOCTOR
- Đơn thuốc tồn tại và có trạng thái ACTIVE
- Bác sĩ là người kê đơn thuốc hoặc có quyền chỉnh sửa
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bác sĩ truy cập đơn thuốc cần chỉnh sửa**
   - Bác sĩ click vào menu "Đơn thuốc của tôi"
   - Hệ thống hiển thị danh sách đơn thuốc
   - Bác sĩ click vào đơn thuốc cần chỉnh sửa

2. **Hệ thống hiển thị chi tiết đơn thuốc**
   - Hệ thống hiển thị thông tin đơn thuốc:
     - Thông tin bệnh nhân
     - Danh sách thuốc hiện tại
     - Lịch uống thuốc
     - Nhật ký tuân thủ (nếu có)
     - Các cảnh báo liên quan

3. **Bác sĩ click nút "Chỉnh sửa đơn thuốc"**
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Form được chia thành các tab:
     - **Thông tin đơn thuốc**: Ghi chú, ngày kết thúc
     - **Danh sách thuốc**: Các thuốc hiện tại
     - **Lịch uống**: Thời gian uống thuốc

4. **Bác sĩ chỉnh sửa thông tin đơn thuốc**
   - Bác sĩ có thể chỉnh sửa:
     - **Ghi chú đơn thuốc**: Cập nhật chẩn đoán, hướng dẫn
     - **Ngày kết thúc**: Kéo dài hoặc rút ngắn thời gian điều trị
     - **Lưu ý đặc biệt**: Thêm cảnh báo, hướng dẫn

5. **Bác sĩ chỉnh sửa danh sách thuốc**

   **5.1. Thêm thuốc mới**
   - Bác sĩ click nút "Thêm thuốc"
   - Hệ thống hiển thị modal chọn thuốc
   - Bác sĩ chọn thuốc và nhập thông tin
   - Bác sĩ click "Thêm"

   **5.2. Chỉnh sửa thuốc hiện tại**
   - Bác sĩ click nút "Chỉnh sửa" trên thuốc cần sửa
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Bác sĩ có thể thay đổi:
     - Liều lượng
     - Tần suất uống
     - Thời gian uống
     - Thời gian điều trị
     - Hướng dẫn
   - Bác sĩ click "Cập nhật"

   **5.3. Xóa thuốc**
   - Bác sĩ click nút "Xóa" trên thuốc cần xóa
   - Hệ thống hiển thị dialog xác nhận
   - Bác sĩ xác nhận xóa
   - Thuốc được xóa khỏi đơn

6. **Hệ thống kiểm tra tính hợp lệ**
   - Hệ thống validate dữ liệu đã chỉnh sửa
   - Kiểm tra tương tác thuốc
   - Kiểm tra liều lượng hợp lý
   - Hiển thị cảnh báo nếu có

7. **Bác sĩ xem lại và xác nhận thay đổi**
   - Hệ thống hiển thị tổng quan thay đổi:
     - Thông tin đã thay đổi
     - Thuốc đã thêm/xóa/sửa
     - Lịch uống thuốc mới
   - Bác sĩ xem lại và click "Xác nhận thay đổi"

8. **Hệ thống cập nhật đơn thuốc**
   - Hệ thống lưu các thay đổi
   - Cập nhật PrescriptionItem
   - Tạo log thay đổi
   - Gửi thông báo cho bệnh nhân về thay đổi
   - Hệ thống hiển thị thông báo thành công

## Alternative Flows

### A1: Đơn thuốc đã hoàn thành
- **Trigger**: Bác sĩ cố gắng chỉnh sửa đơn thuốc có trạng thái COMPLETED
- **Action**: Hệ thống hiển thị cảnh báo "Không thể chỉnh sửa đơn thuốc đã hoàn thành"
- **Return**: Quay lại danh sách đơn thuốc

### A2: Đơn thuốc đã có nhật ký tuân thủ
- **Trigger**: Bác sĩ chỉnh sửa đơn thuốc đã có nhật ký uống thuốc
- **Action**: Hệ thống hiển thị cảnh báo "Đơn thuốc đã có nhật ký uống thuốc, thay đổi có thể ảnh hưởng đến lịch sử"
- **Return**: Bác sĩ có thể chọn tiếp tục hoặc hủy

### A3: Xóa thuốc đã có nhật ký uống
- **Trigger**: Bác sĩ cố gắng xóa thuốc đã có nhật ký uống
- **Action**: Hệ thống hiển thị cảnh báo "Thuốc đã có nhật ký uống, không thể xóa"
- **Return**: Bác sĩ có thể chọn vô hiệu hóa thay vì xóa

### A4: Thay đổi ảnh hưởng đến lịch uống thuốc
- **Trigger**: Bác sĩ thay đổi thời gian uống thuốc
- **Action**: Hệ thống hiển thị cảnh báo "Thay đổi này sẽ ảnh hưởng đến lịch uống thuốc của bệnh nhân"
- **Return**: Bác sĩ có thể chọn tiếp tục hoặc điều chỉnh

## Postconditions
- Đơn thuốc được cập nhật thành công
- Các PrescriptionItem được cập nhật
- Thông báo thay đổi được gửi cho bệnh nhân
- Log thay đổi được ghi lại
- Lịch uống thuốc được cập nhật

## Business Rules
1. Chỉ bác sĩ kê đơn hoặc có quyền mới có thể chỉnh sửa
2. Không thể chỉnh sửa đơn thuốc đã hoàn thành
3. Thay đổi thuốc đã có nhật ký uống cần được xác nhận
4. Đơn thuốc phải có ít nhất một thuốc sau khi chỉnh sửa
5. Ngày kết thúc không được sớm hơn ngày hiện tại
6. Mọi thay đổi phải được thông báo cho bệnh nhân

## Data Requirements
### Input Data
- **Thông tin đơn thuốc**: prescriptionId, notes, endDate, specialNotes
- **Thông tin thuốc**: medicationId, dosage, frequencyPerDay, timesOfDay[], durationDays, route, instructions
- **Thao tác**: add, update, delete
- **Xác nhận**: confirm

### Output Data
- Đơn thuốc đã cập nhật
- Danh sách PrescriptionItem đã thay đổi
- Log thay đổi
- Thông báo thành công
- Thông báo cho bệnh nhân

## API Endpoints
- `GET /doctor/prescriptions/:id` - Lấy chi tiết đơn thuốc
- `PATCH /doctor/prescriptions/:id` - Cập nhật đơn thuốc
- `POST /doctor/prescriptions/:id/items` - Thêm thuốc vào đơn
- `PATCH /doctor/prescriptions/:id/items/:itemId` - Cập nhật thuốc trong đơn
- `DELETE /doctor/prescriptions/:id/items/:itemId` - Xóa thuốc khỏi đơn
- `POST /doctor/prescriptions/:id/validate` - Validate đơn thuốc sau chỉnh sửa

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền DOCTOR
- **403 Forbidden**: Không có quyền chỉnh sửa đơn thuốc này
- **404 Not Found**: Đơn thuốc không tồn tại
- **422 Unprocessable Entity**: Đơn thuốc không hợp lệ sau chỉnh sửa
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Bác sĩ có thể chỉnh sửa đơn thuốc thành công
- Hệ thống validate dữ liệu chính xác
- Cảnh báo được hiển thị khi cần thiết
- Thông báo được gửi cho bệnh nhân
- Log thay đổi được ghi lại đầy đủ
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Users (để lấy thông tin bệnh nhân)
- Module Medications (để lấy danh mục thuốc)
- Module Notifications (để gửi thông báo)
- Database Service
- Validation Service
