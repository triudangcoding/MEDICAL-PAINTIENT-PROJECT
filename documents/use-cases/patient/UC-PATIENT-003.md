# UC-PATIENT-003: Xác Nhận Đã Uống Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-003
- **Tên**: Xác Nhận Đã Uống Thuốc
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân xác nhận đã uống thuốc theo lịch
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Bệnh nhân có đơn thuốc đang hoạt động
- Đến giờ uống thuốc hoặc bệnh nhân muốn xác nhận uống thuốc
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân nhận thông báo nhắc uống thuốc**
   - Hệ thống gửi thông báo nhắc nhở đến giờ uống thuốc
   - Bệnh nhân nhận thông báo qua:
     - Push notification trên điện thoại
     - Thông báo trong app
     - Email (nếu được cấu hình)

2. **Bệnh nhân truy cập trang xác nhận uống thuốc**
   - Bệnh nhân click vào thông báo hoặc truy cập menu "Xác nhận uống thuốc"
   - Hệ thống hiển thị trang xác nhận uống thuốc

3. **Hệ thống hiển thị danh sách thuốc cần uống**
   - Hệ thống load danh sách thuốc cần uống tại thời điểm hiện tại
   - Hiển thị thông tin:
     - **Tên thuốc**: Tên đầy đủ và hàm lượng
     - **Liều lượng**: Số lượng thuốc cần uống
     - **Thời gian**: Khung giờ uống thuốc
     - **Trạng thái**: Chưa uống, Đang chờ xác nhận
     - **Hướng dẫn**: Cách uống thuốc

4. **Bệnh nhân xác nhận uống thuốc**

   **4.1. Xác nhận uống đúng liều**
   - Bệnh nhân click nút "Đã uống" trên thuốc
   - Hệ thống hiển thị dialog xác nhận:
     - Số lượng thuốc đã uống (mặc định = liều quy định)
     - Thời gian uống thuốc (mặc định = thời gian hiện tại)
     - Ghi chú (tùy chọn)
   - Bệnh nhân xác nhận và click "Lưu"

   **4.2. Xác nhận uống khác liều**
   - Bệnh nhân click nút "Uống khác liều"
   - Hệ thống hiển thị form nhập:
     - Số lượng thuốc đã uống (có thể khác liều quy định)
     - Lý do uống khác liều (tùy chọn)
     - Thời gian uống thuốc
     - Ghi chú
   - Bệnh nhân nhập thông tin và click "Lưu"

   **4.3. Xác nhận uống muộn**
   - Bệnh nhân click nút "Uống muộn"
   - Hệ thống hiển thị form nhập:
     - Thời gian thực tế uống thuốc
     - Lý do uống muộn (tùy chọn)
     - Số lượng thuốc đã uống
     - Ghi chú
   - Bệnh nhân nhập thông tin và click "Lưu"

5. **Hệ thống xử lý xác nhận**
   - Hệ thống validate dữ liệu
   - Hệ thống tạo AdherenceLog với trạng thái TAKEN
   - Hệ thống cập nhật trạng thái thuốc thành "Đã uống"
   - Hệ thống gửi thông báo cho bác sĩ (nếu cần)
   - Hệ thống hiển thị thông báo thành công

6. **Bệnh nhân có thể xem lịch sử xác nhận**
   - Bệnh nhân click vào tab "Lịch sử"
   - Hệ thống hiển thị:
     - Danh sách các lần xác nhận uống thuốc
     - Thời gian uống thuốc
     - Số lượng thuốc đã uống
     - Ghi chú
     - Trạng thái: Đúng giờ, Muộn, Khác liều

7. **Bệnh nhân có thể chỉnh sửa xác nhận**
   - Bệnh nhân click vào lần xác nhận cần chỉnh sửa
   - Hệ thống hiển thị form chỉnh sửa
   - Bệnh nhân chỉnh sửa thông tin và click "Cập nhật"
   - Hệ thống cập nhật AdherenceLog

## Alternative Flows

### A1: Bệnh nhân quên uống thuốc
- **Trigger**: Bệnh nhân nhận ra đã quên uống thuốc
- **Action**: Bệnh nhân click nút "Quên uống thuốc"
- **Return**: Hệ thống hiển thị form đánh dấu bỏ lỡ (UC-PATIENT-004)

### A2: Thuốc không còn hoạt động
- **Trigger**: Thuốc đã hết hạn hoặc bị hủy
- **Action**: Hệ thống hiển thị cảnh báo "Thuốc không còn hoạt động"
- **Return**: Bệnh nhân không thể xác nhận uống thuốc

### A3: Xác nhận uống thuốc quá sớm
- **Trigger**: Bệnh nhân xác nhận uống thuốc trước giờ quy định
- **Action**: Hệ thống hiển thị cảnh báo "Bạn đang uống thuốc sớm hơn giờ quy định"
- **Return**: Bệnh nhân có thể chọn tiếp tục hoặc hủy

### A4: Xác nhận uống thuốc quá muộn
- **Trigger**: Bệnh nhân xác nhận uống thuốc sau giờ quy định quá lâu
- **Action**: Hệ thống hiển thị cảnh báo "Bạn đang uống thuốc muộn, có thể ảnh hưởng đến hiệu quả"
- **Return**: Bệnh nhân có thể chọn tiếp tục hoặc hủy

## Postconditions
- AdherenceLog được tạo với trạng thái TAKEN
- Trạng thái thuốc được cập nhật thành "Đã uống"
- Thông báo thành công được hiển thị
- Lịch sử xác nhận được cập nhật
- Thông báo được gửi cho bác sĩ (nếu cần)
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể xác nhận uống thuốc
2. Bệnh nhân chỉ có thể xác nhận thuốc của mình
3. Xác nhận phải có thời gian và số lượng thuốc
4. Không thể xác nhận thuốc đã hết hạn
5. Xác nhận uống muộn vẫn được chấp nhận
6. Ghi chú có thể được thêm vào xác nhận

## Data Requirements
### Input Data
- **Xác nhận uống thuốc**: prescriptionId, prescriptionItemId, takenAt, amount, notes
- **Chỉnh sửa**: adherenceLogId, takenAt, amount, notes
- **Lịch sử**: patientId, startDate, endDate

### Output Data
- AdherenceLog đã tạo
- Trạng thái thuốc đã cập nhật
- Lịch sử xác nhận
- Thông báo thành công
- Cảnh báo (nếu có)

## API Endpoints
- `POST /patient/prescriptions/:id/confirm-taken` - Xác nhận đã uống thuốc
- `POST /patient/prescriptions/:id/confirm-taken-different-dose` - Xác nhận uống khác liều
- `POST /patient/prescriptions/:id/confirm-taken-late` - Xác nhận uống muộn
- `GET /patient/prescriptions/:id/adherence-logs` - Lấy lịch sử xác nhận
- `PATCH /patient/prescriptions/:id/adherence-logs/:logId` - Chỉnh sửa xác nhận
- `GET /patient/prescriptions/today` - Lấy thuốc cần uống hôm nay

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **403 Forbidden**: Không thể xác nhận thuốc này
- **404 Not Found**: Thuốc không tồn tại
- **422 Unprocessable Entity**: Xác nhận không hợp lệ
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Bệnh nhân có thể xác nhận uống thuốc thành công
- Hệ thống validate dữ liệu chính xác
- Cảnh báo được hiển thị khi cần thiết
- Lịch sử xác nhận được lưu đầy đủ
- Thông báo được gửi cho bác sĩ
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Notifications
- Module Users
- Database Service
