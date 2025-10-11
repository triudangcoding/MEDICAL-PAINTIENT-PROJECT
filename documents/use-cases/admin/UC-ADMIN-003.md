# UC-ADMIN-003: Quản Lý Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-ADMIN-003
- **Tên**: Quản Lý Thuốc
- **Actor**: Admin (Quản trị viên)
- **Mô tả**: Admin quản lý danh mục thuốc trong hệ thống
- **Priority**: High
- **Complexity**: Medium

## Preconditions
- Admin đã đăng nhập vào hệ thống
- Admin có quyền ADMIN
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Admin truy cập trang quản lý thuốc**
   - Admin click vào menu "Quản lý thuốc"
   - Hệ thống hiển thị trang quản lý thuốc

2. **Hệ thống hiển thị danh sách thuốc**
   - Hệ thống load danh sách thuốc với phân trang
   - Hiển thị thông tin: Tên thuốc, Hàm lượng, Dạng bào chế, Đơn vị, Mô tả, Trạng thái
   - Hiển thị các nút: Tạo mới, Tìm kiếm, Lọc, Xuất Excel

3. **Admin có thể thực hiện các thao tác:**

   **3.1. Thêm thuốc mới**
   - Admin click nút "Thêm thuốc"
   - Hệ thống hiển thị form thêm thuốc
   - Admin nhập thông tin:
     - Tên thuốc (required)
     - Hàm lượng (optional)
     - Dạng bào chế (optional): Viên nén, Viên nang, Siro, Dịch truyền, etc.
     - Đơn vị (optional): mg, ml, g, etc.
     - Mô tả (optional)
   - Admin click "Lưu"
   - Hệ thống validate dữ liệu
   - Hệ thống tạo thuốc mới và hiển thị thông báo thành công

   **3.2. Xem chi tiết thuốc**
   - Admin click vào tên thuốc trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - Thông tin cơ bản thuốc
     - Lịch sử sử dụng trong đơn thuốc
     - Thống kê tần suất sử dụng

   **3.3. Cập nhật thông tin thuốc**
   - Admin click nút "Chỉnh sửa" trên dòng thuốc
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Admin chỉnh sửa thông tin cần thiết
   - Admin click "Cập nhật"
   - Hệ thống validate và lưu thay đổi

   **3.4. Kích hoạt/Vô hiệu hóa thuốc**
   - Admin click nút toggle trạng thái
   - Hệ thống hiển thị dialog xác nhận
   - Admin xác nhận thay đổi trạng thái
   - Hệ thống cập nhật trạng thái isActive
   - Hệ thống hiển thị thông báo thành công

   **3.5. Xóa thuốc**
   - Admin click nút "Xóa" trên dòng thuốc
   - Hệ thống kiểm tra xem thuốc có đang được sử dụng trong đơn thuốc không
   - Nếu có: Hiển thị cảnh báo "Không thể xóa thuốc đang được sử dụng"
   - Nếu không có: Hiển thị dialog xác nhận xóa
   - Admin xác nhận xóa
   - Hệ thống xóa thuốc và hiển thị thông báo thành công

   **3.6. Tìm kiếm thuốc**
   - Admin nhập từ khóa vào ô tìm kiếm
   - Hệ thống tìm kiếm theo: Tên thuốc, Hàm lượng, Dạng bào chế
   - Hiển thị kết quả tìm kiếm

   **3.7. Lọc thuốc**
   - Admin chọn bộ lọc:
     - Trạng thái: Tất cả, Đang hoạt động, Không hoạt động
     - Dạng bào chế: Viên nén, Viên nang, Siro, etc.
   - Hệ thống áp dụng bộ lọc và hiển thị kết quả

   **3.8. Import thuốc từ Excel**
   - Admin click nút "Import Excel"
   - Hệ thống hiển thị dialog upload file
   - Admin chọn file Excel và upload
   - Hệ thống validate dữ liệu trong file
   - Hệ thống import thuốc và hiển thị kết quả

4. **Hệ thống cập nhật danh sách**
   - Sau mỗi thao tác thành công, hệ thống refresh danh sách
   - Hiển thị thông báo thành công/lỗi

## Alternative Flows

### A1: Thêm thuốc với tên đã tồn tại
- **Trigger**: Admin nhập tên thuốc đã tồn tại
- **Action**: Hệ thống hiển thị cảnh báo "Tên thuốc đã tồn tại, bạn có muốn tiếp tục?"
- **Return**: Admin có thể chọn tiếp tục hoặc hủy

### A2: Xóa thuốc đang được sử dụng
- **Trigger**: Admin cố gắng xóa thuốc có trong đơn thuốc đang hoạt động
- **Action**: Hệ thống hiển thị cảnh báo "Không thể xóa thuốc đang được sử dụng trong đơn thuốc"
- **Return**: Quay lại danh sách

### A3: Import Excel với dữ liệu không hợp lệ
- **Trigger**: File Excel có dữ liệu không đúng format
- **Action**: Hệ thống hiển thị danh sách lỗi và cho phép sửa
- **Return**: Admin có thể sửa và import lại

## Postconditions
- Thuốc mới được thêm thành công (nếu thao tác thêm)
- Thông tin thuốc được cập nhật (nếu thao tác sửa)
- Trạng thái thuốc được thay đổi (nếu thao tác toggle)
- Thuốc được xóa (nếu thao tác xóa)
- Danh sách thuốc được cập nhật
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ ADMIN mới có quyền quản lý thuốc
2. Tên thuốc không được để trống
3. Không thể xóa thuốc đang được sử dụng trong đơn thuốc
4. Thuốc mới được tạo với trạng thái ACTIVE mặc định
5. Hàm lượng và đơn vị phải khớp với nhau (ví dụ: mg với viên nén)
6. File Excel import phải có format chuẩn

## Data Requirements
### Input Data
- **Thêm mới**: name, strength, form, unit, description
- **Cập nhật**: id, các field cần cập nhật
- **Toggle status**: id, isActive
- **Tìm kiếm**: searchTerm
- **Lọc**: isActive, form
- **Import**: file Excel với columns: name, strength, form, unit, description

### Output Data
- Danh sách thuốc với pagination
- Thông tin chi tiết thuốc
- Thống kê sử dụng thuốc
- Thông báo thành công/lỗi
- Kết quả import Excel

## API Endpoints
- `GET /medications` - Lấy danh sách thuốc
- `POST /medications` - Thêm thuốc mới
- `GET /medications/:id` - Lấy chi tiết thuốc
- `PATCH /medications/:id` - Cập nhật thuốc
- `PATCH /medications/:id/status` - Cập nhật trạng thái
- `DELETE /medications/:id` - Xóa thuốc
- `POST /medications/import` - Import thuốc từ Excel
- `GET /medications/export` - Xuất danh sách thuốc

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền ADMIN
- **409 Conflict**: Tên thuốc đã tồn tại
- **422 Unprocessable Entity**: Không thể xóa do có ràng buộc
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Admin có thể thêm thuốc mới thành công
- Admin có thể xem, sửa, xóa thuốc
- Hệ thống validate dữ liệu chính xác
- Import/Export Excel hoạt động tốt
- Giao diện thân thiện, dễ sử dụng
- Performance tốt với danh sách lớn

## Dependencies
- Module Medications
- Module Prescriptions (để kiểm tra thuốc đang sử dụng)
- Database Service
- Validation Service
- Excel Service (cho import/export)
