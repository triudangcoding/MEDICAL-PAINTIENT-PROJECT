# UC-PATIENT-006: Quản Lý Hồ Sơ Bệnh Án

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-006
- **Tên**: Quản Lý Hồ Sơ Bệnh Án
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân xem và cập nhật thông tin sức khỏe cá nhân
- **Priority**: Medium
- **Complexity**: Medium

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân truy cập trang hồ sơ bệnh án**
   - Bệnh nhân click vào menu "Hồ sơ bệnh án"
   - Hệ thống hiển thị trang hồ sơ bệnh án

2. **Hệ thống hiển thị thông tin cá nhân**
   - Hệ thống load thông tin cá nhân:
     - **Thông tin cơ bản**: Họ tên, Số điện thoại, Ngày sinh, Giới tính
     - **Thông tin liên hệ**: Địa chỉ, Email (nếu có)
     - **Thông tin y tế**: Nhóm máu, Chiều cao, Cân nặng

3. **Bệnh nhân có thể xem hồ sơ bệnh án**

   **3.1. Xem tiền sử bệnh**
   - Bệnh nhân click vào tab "Tiền sử bệnh"
   - Hệ thống hiển thị:
     - Danh sách các bệnh đã mắc
     - Thời gian mắc bệnh
     - Mức độ nghiêm trọng
     - Tình trạng hiện tại

   **3.2. Xem dị ứng**
   - Bệnh nhân click vào tab "Dị ứng"
   - Hệ thống hiển thị:
     - Danh sách các chất gây dị ứng
     - Mức độ dị ứng
     - Triệu chứng dị ứng
     - Thuốc đã gây dị ứng

   **3.3. Xem phẫu thuật**
   - Bệnh nhân click vào tab "Phẫu thuật"
   - Hệ thống hiển thị:
     - Danh sách các cuộc phẫu thuật
     - Thời gian phẫu thuật
     - Loại phẫu thuật
     - Bác sĩ thực hiện

   **3.4. Xem tiền sử gia đình**
   - Bệnh nhân click vào tab "Tiền sử gia đình"
   - Hệ thống hiển thị:
     - Các bệnh di truyền trong gia đình
     - Mối quan hệ với người mắc bệnh
     - Mức độ nguy cơ
     - Ghi chú

4. **Bệnh nhân có thể cập nhật thông tin**

   **4.1. Cập nhật thông tin cá nhân**
   - Bệnh nhân click nút "Chỉnh sửa thông tin"
   - Hệ thống hiển thị form chỉnh sửa
   - Bệnh nhân có thể cập nhật:
     - Địa chỉ
     - Email
     - Chiều cao, cân nặng
     - Nhóm máu
   - Bệnh nhân click "Lưu"

   **4.2. Thêm tiền sử bệnh**
   - Bệnh nhân click nút "Thêm bệnh"
   - Hệ thống hiển thị form nhập:
     - Tên bệnh
     - Thời gian mắc bệnh
     - Mức độ nghiêm trọng
     - Tình trạng hiện tại
     - Ghi chú
   - Bệnh nhân nhập thông tin và click "Thêm"

   **4.3. Thêm dị ứng**
   - Bệnh nhân click nút "Thêm dị ứng"
   - Hệ thống hiển thị form nhập:
     - Tên chất gây dị ứng
     - Mức độ dị ứng
     - Triệu chứng
     - Ghi chú
   - Bệnh nhân nhập thông tin và click "Thêm"

   **4.4. Thêm phẫu thuật**
   - Bệnh nhân click nút "Thêm phẫu thuật"
   - Hệ thống hiển thị form nhập:
     - Tên phẫu thuật
     - Thời gian phẫu thuật
     - Bệnh viện
     - Bác sĩ thực hiện
     - Ghi chú
   - Bệnh nhân nhập thông tin và click "Thêm"

5. **Bệnh nhân có thể xem thuốc đang dùng**
   - Bệnh nhân click vào tab "Thuốc đang dùng"
   - Hệ thống hiển thị:
     - Danh sách thuốc hiện tại
     - Liều lượng và tần suất
     - Thời gian sử dụng
     - Bác sĩ kê đơn
     - Ghi chú

6. **Bệnh nhân có thể xem lối sống**
   - Bệnh nhân click vào tab "Lối sống"
   - Hệ thống hiển thị:
     - Thói quen ăn uống
     - Thói quen tập thể dục
     - Thói quen ngủ
     - Hút thuốc, uống rượu
     - Stress, căng thẳng

7. **Bệnh nhân có thể cập nhật lối sống**
   - Bệnh nhân click nút "Cập nhật lối sống"
   - Hệ thống hiển thị form cập nhật
   - Bệnh nhân có thể cập nhật:
     - Thói quen ăn uống
     - Thói quen tập thể dục
     - Thói quen ngủ
     - Hút thuốc, uống rượu
     - Stress, căng thẳng
   - Bệnh nhân click "Lưu"

## Alternative Flows

### A1: Bệnh nhân chưa có hồ sơ bệnh án
- **Trigger**: Bệnh nhân chưa có hồ sơ bệnh án
- **Action**: Hệ thống hiển thị thông báo "Bạn chưa có hồ sơ bệnh án"
- **Return**: Hiển thị nút "Tạo hồ sơ bệnh án"

### A2: Thông tin không được phép chỉnh sửa
- **Trigger**: Bệnh nhân cố gắng chỉnh sửa thông tin không được phép
- **Action**: Hệ thống hiển thị cảnh báo "Thông tin này không thể chỉnh sửa"
- **Return**: Bệnh nhân có thể liên hệ bác sĩ để cập nhật

### A3: Dữ liệu không hợp lệ
- **Trigger**: Bệnh nhân nhập dữ liệu không hợp lệ
- **Action**: Hệ thống hiển thị lỗi validation
- **Return**: Bệnh nhân có thể sửa và thử lại

## Postconditions
- Hồ sơ bệnh án được hiển thị đầy đủ
- Thông tin được cập nhật (nếu được yêu cầu)
- Thông tin mới được thêm (nếu được yêu cầu)
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể xem hồ sơ bệnh án
2. Bệnh nhân chỉ có thể xem và cập nhật hồ sơ của mình
3. Một số thông tin không thể chỉnh sửa (họ tên, số điện thoại, ngày sinh)
4. Thông tin y tế phải chính xác và đầy đủ
5. Dị ứng và tiền sử bệnh quan trọng phải được cập nhật
6. Thông tin bệnh nhân phải được bảo mật

## Data Requirements
### Input Data
- **Cập nhật thông tin**: address, email, height, weight, bloodType
- **Thêm tiền sử bệnh**: condition, startDate, severity, status, notes
- **Thêm dị ứng**: allergen, severity, symptoms, notes
- **Thêm phẫu thuật**: surgery, date, hospital, doctor, notes
- **Cập nhật lối sống**: diet, exercise, sleep, smoking, alcohol, stress

### Output Data
- Hồ sơ bệnh án
- Thông tin cá nhân
- Tiền sử bệnh
- Dị ứng
- Phẫu thuật
- Tiền sử gia đình
- Thuốc đang dùng
- Lối sống

## API Endpoints
- `GET /patient/medical-history` - Lấy hồ sơ bệnh án
- `PATCH /patient/profile` - Cập nhật thông tin cá nhân
- `POST /patient/medical-history/conditions` - Thêm tiền sử bệnh
- `POST /patient/medical-history/allergies` - Thêm dị ứng
- `POST /patient/medical-history/surgeries` - Thêm phẫu thuật
- `PATCH /patient/medical-history/lifestyle` - Cập nhật lối sống
- `GET /patient/current-medications` - Lấy thuốc đang dùng

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **403 Forbidden**: Không thể chỉnh sửa thông tin này
- **404 Not Found**: Hồ sơ bệnh án không tồn tại
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Hồ sơ bệnh án được hiển thị đầy đủ và chính xác
- Bệnh nhân có thể cập nhật thông tin được phép
- Thông tin mới được thêm thành công
- Validation dữ liệu hoạt động tốt
- Giao diện thân thiện, dễ sử dụng
- Thông tin được bảo mật

## Dependencies
- Module Users
- Module Prescriptions
- Database Service
