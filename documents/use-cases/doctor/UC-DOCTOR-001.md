# UC-DOCTOR-001: Quản Lý Bệnh Nhân

## Thông Tin Cơ Bản
- **ID**: UC-DOCTOR-001
- **Tên**: Quản Lý Bệnh Nhân
- **Actor**: Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ quản lý danh sách bệnh nhân được phân công cho mình
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Bác sĩ đã đăng nhập vào hệ thống
- Bác sĩ có quyền DOCTOR
- Hệ thống đang hoạt động bình thường
- Bác sĩ có ít nhất một bệnh nhân được phân công

## Main Flow
1. **Bác sĩ truy cập trang quản lý bệnh nhân**
   - Bác sĩ click vào menu "Bệnh nhân của tôi"
   - Hệ thống hiển thị trang quản lý bệnh nhân

2. **Hệ thống hiển thị danh sách bệnh nhân**
   - Hệ thống load danh sách bệnh nhân được phân công cho bác sĩ
   - Hiển thị thông tin: Tên bệnh nhân, Số điện thoại, Tuổi, Giới tính, Trạng thái điều trị
   - Hiển thị các nút: Xem chi tiết, Tạo đơn thuốc, Lịch sử điều trị, Tìm kiếm

3. **Bác sĩ có thể thực hiện các thao tác:**

   **3.1. Xem thông tin chi tiết bệnh nhân**
   - Bác sĩ click vào tên bệnh nhân trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - **Thông tin cá nhân**: Họ tên, Số điện thoại, Ngày sinh, Giới tính, Địa chỉ
     - **Hồ sơ bệnh án**: Tiền sử bệnh, Dị ứng, Phẫu thuật, Tiền sử gia đình
     - **Thuốc đang dùng**: Danh sách thuốc hiện tại
     - **Lối sống**: Thông tin về lối sống, thói quen

   **3.2. Cập nhật hồ sơ bệnh án**
   - Bác sĩ click nút "Cập nhật hồ sơ" trên bệnh nhân
   - Hệ thống hiển thị form chỉnh sửa hồ sơ bệnh án
   - Bác sĩ có thể cập nhật:
     - Tiền sử bệnh
     - Dị ứng
     - Phẫu thuật
     - Tiền sử gia đình
     - Lối sống
     - Ghi chú
   - Bác sĩ click "Lưu"
   - Hệ thống validate và lưu thay đổi

   **3.3. Xem lịch sử điều trị**
   - Bác sĩ click nút "Lịch sử điều trị" trên bệnh nhân
   - Hệ thống hiển thị trang lịch sử điều trị với:
     - Danh sách đơn thuốc đã kê
     - Nhật ký tuân thủ uống thuốc
     - Các cảnh báo đã gửi
     - Ghi chú điều trị
     - Biểu đồ tuân thủ theo thời gian

   **3.4. Tạo đơn thuốc mới**
   - Bác sĩ click nút "Tạo đơn thuốc" trên bệnh nhân
   - Hệ thống chuyển đến trang tạo đơn thuốc với thông tin bệnh nhân đã điền sẵn
   - Bác sĩ thực hiện quy trình tạo đơn thuốc (UC-DOCTOR-002)

   **3.5. Tìm kiếm bệnh nhân**
   - Bác sĩ nhập từ khóa vào ô tìm kiếm
   - Hệ thống tìm kiếm theo: Tên bệnh nhân, Số điện thoại
   - Hiển thị kết quả tìm kiếm

   **3.6. Lọc bệnh nhân**
   - Bác sĩ chọn bộ lọc:
     - Trạng thái điều trị: Đang điều trị, Hoàn thành, Tạm dừng
     - Tuổi: Trẻ em (<18), Người lớn (18-65), Người già (>65)
     - Giới tính: Nam, Nữ, Khác
   - Hệ thống áp dụng bộ lọc và hiển thị kết quả

4. **Bác sĩ có thể thực hiện các thao tác nâng cao:**

   **4.1. Theo dõi tuân thủ**
   - Bác sĩ click vào tab "Theo dõi tuân thủ"
   - Hệ thống hiển thị:
     - Danh sách bệnh nhân với tỷ lệ tuân thủ
     - Cảnh báo tuân thủ thấp
     - Biểu đồ tuân thủ tổng quan
     - Danh sách bệnh nhân cần nhắc nhở

   **4.2. Gửi nhắc nhở**
   - Bác sĩ chọn bệnh nhân cần nhắc nhở
   - Bác sĩ click nút "Gửi nhắc nhở"
   - Hệ thống hiển thị form nhập nội dung nhắc nhở
   - Bác sĩ nhập nội dung và click "Gửi"
   - Hệ thống gửi thông báo cho bệnh nhân

5. **Hệ thống cập nhật danh sách**
   - Sau mỗi thao tác thành công, hệ thống refresh danh sách
   - Hiển thị thông báo thành công/lỗi
   - Cập nhật real-time khi có thay đổi

## Alternative Flows

### A1: Bác sĩ chưa có bệnh nhân được phân công
- **Trigger**: Bác sĩ chưa có bệnh nhân nào được phân công
- **Action**: Hệ thống hiển thị thông báo "Bạn chưa có bệnh nhân nào được phân công"
- **Return**: Hiển thị trang trống với nút "Liên hệ Admin"

### A2: Bệnh nhân không có hồ sơ bệnh án
- **Trigger**: Bệnh nhân chưa có hồ sơ bệnh án
- **Action**: Hệ thống hiển thị thông báo "Bệnh nhân chưa có hồ sơ bệnh án"
- **Return**: Hiển thị nút "Tạo hồ sơ bệnh án"

### A3: Lỗi khi cập nhật hồ sơ
- **Trigger**: Có lỗi khi lưu hồ sơ bệnh án
- **Action**: Hệ thống hiển thị thông báo lỗi và cho phép thử lại
- **Return**: Quay lại form chỉnh sửa

## Postconditions
- Hồ sơ bệnh án được cập nhật (nếu thao tác cập nhật)
- Lịch sử điều trị được hiển thị (nếu được yêu cầu)
- Nhắc nhở được gửi cho bệnh nhân (nếu được yêu cầu)
- Danh sách bệnh nhân được cập nhật
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bác sĩ có quyền DOCTOR mới có thể quản lý bệnh nhân
2. Bác sĩ chỉ có thể xem và quản lý bệnh nhân được phân công cho mình
3. Hồ sơ bệnh án chỉ có thể được cập nhật bởi bác sĩ điều trị
4. Lịch sử điều trị không thể chỉnh sửa
5. Nhắc nhở phải có nội dung rõ ràng và phù hợp
6. Thông tin bệnh nhân phải được bảo mật

## Data Requirements
### Input Data
- **Cập nhật hồ sơ**: patientId, conditions[], allergies[], surgeries[], familyHistory, lifestyle, notes
- **Tìm kiếm**: searchTerm
- **Lọc**: treatmentStatus, ageGroup, gender
- **Nhắc nhở**: patientId, message

### Output Data
- Danh sách bệnh nhân với pagination
- Thông tin chi tiết bệnh nhân
- Hồ sơ bệnh án
- Lịch sử điều trị
- Thống kê tuân thủ
- Thông báo thành công/lỗi

## API Endpoints
- `GET /doctor/patients` - Lấy danh sách bệnh nhân của bác sĩ
- `GET /doctor/patients/:id` - Lấy chi tiết bệnh nhân
- `PATCH /doctor/patients/:id/medical-history` - Cập nhật hồ sơ bệnh án
- `GET /doctor/patients/:id/treatment-history` - Lấy lịch sử điều trị
- `GET /doctor/patients/adherence` - Lấy thống kê tuân thủ
- `POST /doctor/patients/:id/reminder` - Gửi nhắc nhở cho bệnh nhân

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền DOCTOR
- **403 Forbidden**: Không có quyền truy cập bệnh nhân này
- **404 Not Found**: Bệnh nhân không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Bác sĩ có thể xem danh sách bệnh nhân được phân công
- Bác sĩ có thể xem và cập nhật hồ sơ bệnh án
- Lịch sử điều trị được hiển thị chính xác
- Theo dõi tuân thủ hoạt động hiệu quả
- Gửi nhắc nhở thành công
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Users (để lấy thông tin bệnh nhân)
- Module Prescriptions (để lấy đơn thuốc)
- Module Notifications (để gửi nhắc nhở)
- Module Reports (để thống kê tuân thủ)
- Database Service
