# UC-ADMIN-001: Quản Lý Người Dùng

## Thông Tin Cơ Bản
- **ID**: UC-ADMIN-001
- **Tên**: Quản Lý Người Dùng
- **Actor**: Admin (Quản trị viên)
- **Mô tả**: Admin có thể tạo, xem, cập nhật và xóa người dùng trong hệ thống
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Admin đã đăng nhập vào hệ thống
- Admin có quyền ADMIN
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Admin truy cập trang quản lý người dùng**
   - Admin click vào menu "Quản lý người dùng"
   - Hệ thống hiển thị trang quản lý người dùng

2. **Hệ thống hiển thị danh sách người dùng**
   - Hệ thống load danh sách người dùng với phân trang (mặc định 10 items/page)
   - Hiển thị thông tin: Tên, Số điện thoại, Vai trò, Trạng thái, Ngày tạo
   - Hiển thị các nút: Tạo mới, Tìm kiếm, Lọc, Xuất Excel

3. **Admin có thể thực hiện các thao tác:**

   **3.1. Tạo người dùng mới**
   - Admin click nút "Tạo mới"
   - Hệ thống hiển thị form tạo người dùng
   - Admin nhập thông tin:
     - Họ tên (required)
     - Số điện thoại (required, unique)
     - Mật khẩu (required, min 6 ký tự)
     - Vai trò: DOCTOR hoặc PATIENT
     - Chuyên khoa (nếu là DOCTOR)
   - Admin click "Lưu"
   - Hệ thống validate dữ liệu
   - Hệ thống tạo user mới và hiển thị thông báo thành công

   **3.2. Xem chi tiết người dùng**
   - Admin click vào tên người dùng trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - Thông tin cơ bản
     - Hồ sơ bệnh án (nếu là PATIENT)
     - Lịch sử hoạt động
     - Đơn thuốc (nếu có)

   **3.3. Cập nhật thông tin người dùng**
   - Admin click nút "Chỉnh sửa" trên dòng người dùng
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Admin chỉnh sửa thông tin cần thiết
   - Admin click "Cập nhật"
   - Hệ thống validate và lưu thay đổi

   **3.4. Xóa người dùng**
   - Admin click nút "Xóa" trên dòng người dùng
   - Hệ thống hiển thị dialog xác nhận
   - Admin xác nhận xóa
   - Hệ thống thực hiện soft delete (cập nhật deletedAt)
   - Hệ thống hiển thị thông báo thành công

   **3.5. Tìm kiếm người dùng**
   - Admin nhập từ khóa vào ô tìm kiếm
   - Hệ thống tìm kiếm theo: Tên, Số điện thoại
   - Hiển thị kết quả tìm kiếm

   **3.6. Lọc người dùng**
   - Admin chọn bộ lọc:
     - Vai trò: ADMIN, DOCTOR, PATIENT
     - Trạng thái: ACTIVE, INACTIVE, BLOCKED
     - Chuyên khoa (nếu có)
   - Hệ thống áp dụng bộ lọc và hiển thị kết quả

4. **Hệ thống cập nhật danh sách**
   - Sau mỗi thao tác thành công, hệ thống refresh danh sách
   - Hiển thị thông báo thành công/lỗi

## Alternative Flows

### A1: Tạo người dùng với số điện thoại đã tồn tại
- **Trigger**: Admin nhập số điện thoại đã tồn tại
- **Action**: Hệ thống hiển thị lỗi "Số điện thoại đã được sử dụng"
- **Return**: Quay lại bước 3.1

### A2: Xóa người dùng có đơn thuốc đang hoạt động
- **Trigger**: Admin cố gắng xóa bác sĩ có đơn thuốc đang hoạt động
- **Action**: Hệ thống hiển thị cảnh báo "Không thể xóa bác sĩ có đơn thuốc đang hoạt động"
- **Return**: Quay lại danh sách

### A3: Mất kết nối mạng
- **Trigger**: Mất kết nối trong quá trình thao tác
- **Action**: Hệ thống hiển thị thông báo lỗi và cho phép thử lại
- **Return**: Quay lại trạng thái trước đó

## Postconditions
- Người dùng mới được tạo thành công (nếu thao tác tạo)
- Thông tin người dùng được cập nhật (nếu thao tác sửa)
- Người dùng được đánh dấu xóa (nếu thao tác xóa)
- Danh sách người dùng được cập nhật
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ ADMIN mới có quyền quản lý người dùng
2. Không thể xóa ADMIN cuối cùng trong hệ thống
3. Không thể xóa bác sĩ có đơn thuốc đang hoạt động
4. Số điện thoại phải unique trong hệ thống
5. Mật khẩu phải có ít nhất 6 ký tự
6. Soft delete được sử dụng thay vì hard delete

## Data Requirements
### Input Data
- **Tạo mới**: fullName, phoneNumber, password, role, majorDoctorId (optional)
- **Cập nhật**: id, các field cần cập nhật
- **Tìm kiếm**: searchTerm
- **Lọc**: role, status, majorDoctorId

### Output Data
- Danh sách người dùng với pagination
- Thông tin chi tiết người dùng
- Thông báo thành công/lỗi

## API Endpoints
- `GET /admin/users` - Lấy danh sách người dùng
- `POST /admin/users` - Tạo người dùng mới
- `GET /admin/users/:id` - Lấy chi tiết người dùng
- `PATCH /admin/users/:id` - Cập nhật người dùng
- `DELETE /admin/users/:id` - Xóa người dùng
- `GET /admin/users/search` - Tìm kiếm người dùng

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền ADMIN
- **409 Conflict**: Số điện thoại đã tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Admin có thể tạo người dùng mới thành công
- Admin có thể xem, sửa, xóa người dùng
- Hệ thống validate dữ liệu chính xác
- Giao diện thân thiện, dễ sử dụng
- Performance tốt với danh sách lớn (pagination)

## Dependencies
- Module Users
- Module Authentication
- Module Major (cho chuyên khoa bác sĩ)
- Database Service
- Validation Service
