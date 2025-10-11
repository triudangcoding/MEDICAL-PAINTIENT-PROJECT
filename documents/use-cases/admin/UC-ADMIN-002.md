# UC-ADMIN-002: Quản Lý Chuyên Khoa

## Thông Tin Cơ Bản
- **ID**: UC-ADMIN-002
- **Tên**: Quản Lý Chuyên Khoa
- **Actor**: Admin (Quản trị viên)
- **Mô tả**: Admin quản lý các chuyên khoa bác sĩ trong hệ thống
- **Priority**: High
- **Complexity**: Low

## Preconditions
- Admin đã đăng nhập vào hệ thống
- Admin có quyền ADMIN
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Admin truy cập trang quản lý chuyên khoa**
   - Admin click vào menu "Quản lý chuyên khoa"
   - Hệ thống hiển thị trang quản lý chuyên khoa

2. **Hệ thống hiển thị danh sách chuyên khoa**
   - Hệ thống load danh sách chuyên khoa với phân trang
   - Hiển thị thông tin: Mã, Tên, Tên tiếng Anh, Mô tả, Trạng thái, Thứ tự sắp xếp
   - Hiển thị các nút: Tạo mới, Tìm kiếm, Lọc, Sắp xếp

3. **Admin có thể thực hiện các thao tác:**

   **3.1. Tạo chuyên khoa mới**
   - Admin click nút "Tạo mới"
   - Hệ thống hiển thị form tạo chuyên khoa
   - Admin nhập thông tin:
     - Mã chuyên khoa (required, unique, uppercase)
     - Tên chuyên khoa (required)
     - Tên tiếng Anh (optional)
     - Mô tả (optional)
     - Thứ tự sắp xếp (optional, default 0)
   - Admin click "Lưu"
   - Hệ thống validate dữ liệu
   - Hệ thống tạo chuyên khoa mới và hiển thị thông báo thành công

   **3.2. Xem chi tiết chuyên khoa**
   - Admin click vào tên chuyên khoa trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - Thông tin cơ bản chuyên khoa
     - Danh sách bác sĩ thuộc chuyên khoa
     - Thống kê số lượng bác sĩ

   **3.3. Cập nhật thông tin chuyên khoa**
   - Admin click nút "Chỉnh sửa" trên dòng chuyên khoa
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Admin chỉnh sửa thông tin cần thiết
   - Admin click "Cập nhật"
   - Hệ thống validate và lưu thay đổi

   **3.4. Kích hoạt/Vô hiệu hóa chuyên khoa**
   - Admin click nút toggle trạng thái
   - Hệ thống hiển thị dialog xác nhận
   - Admin xác nhận thay đổi trạng thái
   - Hệ thống cập nhật trạng thái isActive
   - Hệ thống hiển thị thông báo thành công

   **3.5. Xóa chuyên khoa**
   - Admin click nút "Xóa" trên dòng chuyên khoa
   - Hệ thống kiểm tra xem có bác sĩ nào thuộc chuyên khoa không
   - Nếu có bác sĩ: Hiển thị cảnh báo "Không thể xóa chuyên khoa có bác sĩ"
   - Nếu không có bác sĩ: Hiển thị dialog xác nhận xóa
   - Admin xác nhận xóa
   - Hệ thống xóa chuyên khoa và hiển thị thông báo thành công

   **3.6. Tìm kiếm chuyên khoa**
   - Admin nhập từ khóa vào ô tìm kiếm
   - Hệ thống tìm kiếm theo: Mã, Tên, Tên tiếng Anh
   - Hiển thị kết quả tìm kiếm

   **3.7. Lọc chuyên khoa**
   - Admin chọn bộ lọc:
     - Trạng thái: Tất cả, Đang hoạt động, Không hoạt động
   - Hệ thống áp dụng bộ lọc và hiển thị kết quả

   **3.8. Sắp xếp chuyên khoa**
   - Admin click vào header cột để sắp xếp
   - Hệ thống sắp xếp theo: Tên, Thứ tự sắp xếp, Ngày tạo
   - Hiển thị kết quả đã sắp xếp

4. **Hệ thống cập nhật danh sách**
   - Sau mỗi thao tác thành công, hệ thống refresh danh sách
   - Hiển thị thông báo thành công/lỗi

## Alternative Flows

### A1: Tạo chuyên khoa với mã đã tồn tại
- **Trigger**: Admin nhập mã chuyên khoa đã tồn tại
- **Action**: Hệ thống hiển thị lỗi "Mã chuyên khoa đã được sử dụng"
- **Return**: Quay lại bước 3.1

### A2: Xóa chuyên khoa có bác sĩ
- **Trigger**: Admin cố gắng xóa chuyên khoa có bác sĩ thuộc về
- **Action**: Hệ thống hiển thị cảnh báo "Không thể xóa chuyên khoa có bác sĩ"
- **Return**: Quay lại danh sách

### A3: Vô hiệu hóa chuyên khoa có bác sĩ đang hoạt động
- **Trigger**: Admin cố gắng vô hiệu hóa chuyên khoa có bác sĩ đang hoạt động
- **Action**: Hệ thống hiển thị cảnh báo "Chuyên khoa có bác sĩ đang hoạt động"
- **Return**: Quay lại danh sách

## Postconditions
- Chuyên khoa mới được tạo thành công (nếu thao tác tạo)
- Thông tin chuyên khoa được cập nhật (nếu thao tác sửa)
- Trạng thái chuyên khoa được thay đổi (nếu thao tác toggle)
- Chuyên khoa được xóa (nếu thao tác xóa)
- Danh sách chuyên khoa được cập nhật
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ ADMIN mới có quyền quản lý chuyên khoa
2. Mã chuyên khoa phải unique và uppercase
3. Không thể xóa chuyên khoa có bác sĩ thuộc về
4. Không thể vô hiệu hóa chuyên khoa có bác sĩ đang hoạt động
5. Thứ tự sắp xếp mặc định là 0
6. Tên chuyên khoa không được để trống

## Data Requirements
### Input Data
- **Tạo mới**: code, name, nameEn, description, sortOrder
- **Cập nhật**: id, các field cần cập nhật
- **Toggle status**: id, isActive
- **Tìm kiếm**: searchTerm
- **Lọc**: isActive

### Output Data
- Danh sách chuyên khoa với pagination
- Thông tin chi tiết chuyên khoa
- Danh sách bác sĩ thuộc chuyên khoa
- Thông báo thành công/lỗi

## API Endpoints
- `GET /major-doctors` - Lấy danh sách chuyên khoa
- `POST /major-doctors` - Tạo chuyên khoa mới
- `GET /major-doctors/:id` - Lấy chi tiết chuyên khoa
- `PATCH /major-doctors/:id` - Cập nhật chuyên khoa
- `PATCH /major-doctors/:id/status` - Cập nhật trạng thái
- `DELETE /major-doctors/:id` - Xóa chuyên khoa
- `GET /major-doctors/active` - Lấy danh sách chuyên khoa đang hoạt động

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền ADMIN
- **409 Conflict**: Mã chuyên khoa đã tồn tại
- **422 Unprocessable Entity**: Không thể xóa/vô hiệu hóa do có ràng buộc
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Admin có thể tạo chuyên khoa mới thành công
- Admin có thể xem, sửa, xóa chuyên khoa
- Hệ thống validate dữ liệu chính xác
- Giao diện thân thiện, dễ sử dụng
- Performance tốt với danh sách lớn
- Sắp xếp và lọc hoạt động chính xác

## Dependencies
- Module Major
- Module Users (để kiểm tra bác sĩ thuộc chuyên khoa)
- Database Service
- Validation Service
