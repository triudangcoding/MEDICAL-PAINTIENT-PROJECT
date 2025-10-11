# UC-ADMIN-005: Quản Lý Đơn Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-ADMIN-005
- **Tên**: Quản Lý Đơn Thuốc
- **Actor**: Admin (Quản trị viên)
- **Mô tả**: Admin có thể xem, chỉnh sửa và quản lý tất cả đơn thuốc trong hệ thống
- **Priority**: High
- **Complexity**: High

## Preconditions
- Admin đã đăng nhập vào hệ thống
- Admin có quyền ADMIN
- Hệ thống đang hoạt động bình thường
- Có đơn thuốc trong hệ thống

## Main Flow
1. **Admin truy cập trang quản lý đơn thuốc**
   - Admin click vào menu "Quản lý đơn thuốc"
   - Hệ thống hiển thị trang quản lý đơn thuốc

2. **Hệ thống hiển thị danh sách đơn thuốc**
   - Hệ thống load danh sách đơn thuốc với phân trang
   - Hiển thị thông tin: Mã đơn, Bệnh nhân, Bác sĩ, Trạng thái, Ngày tạo, Ngày kết thúc
   - Hiển thị các nút: Tìm kiếm, Lọc, Xuất Excel, Refresh

3. **Admin có thể thực hiện các thao tác:**

   **3.1. Xem chi tiết đơn thuốc**
   - Admin click vào mã đơn thuốc trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - Thông tin đơn thuốc: Mã, Bệnh nhân, Bác sĩ, Trạng thái, Ghi chú
     - Danh sách thuốc: Tên thuốc, Liều lượng, Tần suất, Thời gian uống
     - Nhật ký tuân thủ: Lịch sử uống thuốc của bệnh nhân
     - Cảnh báo: Các cảnh báo liên quan đến đơn thuốc

   **3.2. Chỉnh sửa đơn thuốc**
   - Admin click nút "Chỉnh sửa" trên dòng đơn thuốc
   - Hệ thống hiển thị form chỉnh sửa với dữ liệu hiện tại
   - Admin có thể chỉnh sửa:
     - Thông tin đơn thuốc: Ghi chú, Ngày kết thúc
     - Danh sách thuốc: Thêm/xóa/sửa thuốc
     - Liều lượng và tần suất uống
   - Admin click "Cập nhật"
   - Hệ thống validate và lưu thay đổi
   - Hệ thống gửi thông báo cho bệnh nhân về thay đổi

   **3.3. Hủy đơn thuốc**
   - Admin click nút "Hủy đơn" trên dòng đơn thuốc
   - Hệ thống hiển thị dialog xác nhận với lý do hủy
   - Admin nhập lý do hủy và xác nhận
   - Hệ thống cập nhật trạng thái đơn thuốc thành CANCELLED
   - Hệ thống gửi thông báo cho bệnh nhân và bác sĩ

   **3.4. Xem nhật ký tuân thủ**
   - Admin click nút "Nhật ký tuân thủ" trên dòng đơn thuốc
   - Hệ thống hiển thị trang nhật ký tuân thủ với:
     - Biểu đồ tuân thủ theo thời gian
     - Danh sách chi tiết từng lần uống thuốc
     - Thống kê tỷ lệ tuân thủ
     - Các lần bỏ lỡ thuốc

   **3.5. Tìm kiếm đơn thuốc**
   - Admin nhập từ khóa vào ô tìm kiếm
   - Hệ thống tìm kiếm theo: Mã đơn, Tên bệnh nhân, Tên bác sĩ
   - Hiển thị kết quả tìm kiếm

   **3.6. Lọc đơn thuốc**
   - Admin chọn bộ lọc:
     - Trạng thái: ACTIVE, COMPLETED, CANCELLED
     - Bác sĩ: Chọn bác sĩ cụ thể
     - Chuyên khoa: Chọn chuyên khoa
     - Khoảng thời gian: Từ ngày - đến ngày
   - Hệ thống áp dụng bộ lọc và hiển thị kết quả

   **3.7. Xuất danh sách đơn thuốc**
   - Admin click nút "Xuất Excel"
   - Hệ thống hiển thị dialog chọn dữ liệu xuất
   - Admin chọn các cột cần xuất và click "Xuất"
   - Hệ thống tạo file Excel và cho phép download

4. **Admin có thể thực hiện các thao tác nâng cao:**

   **4.1. Quản lý cảnh báo**
   - Admin click vào tab "Cảnh báo"
   - Hệ thống hiển thị danh sách cảnh báo:
     - Cảnh báo tuân thủ thấp
     - Cảnh báo bỏ lỡ thuốc
     - Cảnh báo khác
   - Admin có thể:
     - Xem chi tiết cảnh báo
     - Đánh dấu đã xử lý
     - Gửi nhắc nhở cho bệnh nhân

   **4.2. Thống kê tổng quan**
   - Admin click vào tab "Thống kê"
   - Hệ thống hiển thị:
     - Tổng số đơn thuốc theo trạng thái
     - Biểu đồ đơn thuốc theo thời gian
     - Top bác sĩ kê đơn nhiều nhất
     - Top thuốc được kê nhiều nhất

5. **Hệ thống cập nhật danh sách**
   - Sau mỗi thao tác thành công, hệ thống refresh danh sách
   - Hiển thị thông báo thành công/lỗi
   - Cập nhật real-time khi có thay đổi

## Alternative Flows

### A1: Chỉnh sửa đơn thuốc đã hoàn thành
- **Trigger**: Admin cố gắng chỉnh sửa đơn thuốc có trạng thái COMPLETED
- **Action**: Hệ thống hiển thị cảnh báo "Không thể chỉnh sửa đơn thuốc đã hoàn thành"
- **Return**: Quay lại danh sách

### A2: Hủy đơn thuốc có nhật ký tuân thủ
- **Trigger**: Admin cố gắng hủy đơn thuốc đã có nhật ký uống thuốc
- **Action**: Hệ thống hiển thị cảnh báo "Đơn thuốc đã có nhật ký uống thuốc, bạn có chắc muốn hủy?"
- **Return**: Admin có thể chọn tiếp tục hoặc hủy

### A3: Lỗi khi gửi thông báo
- **Trigger**: Hệ thống không thể gửi thông báo cho bệnh nhân
- **Action**: Hệ thống vẫn lưu thay đổi và ghi log lỗi gửi thông báo
- **Return**: Hiển thị thông báo thành công với ghi chú "Thông báo có thể chưa được gửi"

## Postconditions
- Đơn thuốc được cập nhật thành công (nếu thao tác sửa)
- Đơn thuốc được hủy (nếu thao tác hủy)
- Nhật ký tuân thủ được hiển thị (nếu được yêu cầu)
- Cảnh báo được xử lý (nếu được yêu cầu)
- Danh sách đơn thuốc được cập nhật
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ ADMIN mới có quyền quản lý tất cả đơn thuốc
2. Không thể chỉnh sửa đơn thuốc đã hoàn thành
3. Khi hủy đơn thuốc, phải có lý do hủy
4. Mọi thay đổi đơn thuốc phải được thông báo cho bệnh nhân
5. Nhật ký tuân thủ không thể chỉnh sửa
6. Cảnh báo phải được xử lý trong thời gian hợp lý

## Data Requirements
### Input Data
- **Chỉnh sửa**: id, notes, endDate, items[]
- **Hủy đơn**: id, reason
- **Tìm kiếm**: searchTerm
- **Lọc**: status, doctorId, majorDoctorId, startDate, endDate
- **Xuất**: columns[], format

### Output Data
- Danh sách đơn thuốc với pagination
- Chi tiết đơn thuốc
- Nhật ký tuân thủ
- Danh sách cảnh báo
- Thống kê tổng quan
- File Excel đã xuất

## API Endpoints
- `GET /admin/prescriptions` - Lấy danh sách đơn thuốc
- `GET /admin/prescriptions/:id` - Lấy chi tiết đơn thuốc
- `PATCH /admin/prescriptions/:id` - Cập nhật đơn thuốc
- `PATCH /admin/prescriptions/:id/cancel` - Hủy đơn thuốc
- `GET /admin/prescriptions/:id/adherence-logs` - Lấy nhật ký tuân thủ
- `GET /admin/prescriptions/alerts` - Lấy danh sách cảnh báo
- `POST /admin/prescriptions/export` - Xuất danh sách đơn thuốc

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền ADMIN
- **403 Forbidden**: Không thể chỉnh sửa đơn thuốc đã hoàn thành
- **404 Not Found**: Đơn thuốc không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Admin có thể xem tất cả đơn thuốc trong hệ thống
- Admin có thể chỉnh sửa đơn thuốc hợp lệ
- Admin có thể hủy đơn thuốc với lý do
- Nhật ký tuân thủ được hiển thị chính xác
- Cảnh báo được quản lý hiệu quả
- Xuất Excel hoạt động tốt
- Giao diện trực quan, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Users (để lấy thông tin bác sĩ, bệnh nhân)
- Module Notifications (để gửi thông báo)
- Module Reports (để thống kê)
- Database Service
- Export Service
