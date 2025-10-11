# UC-PATIENT-004: Đánh Dấu Bỏ Lỡ Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-004
- **Tên**: Đánh Dấu Bỏ Lỡ Thuốc
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân đánh dấu khi bỏ lỡ uống thuốc
- **Priority**: Medium
- **Complexity**: Low

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Bệnh nhân có đơn thuốc đang hoạt động
- Bệnh nhân đã bỏ lỡ uống thuốc
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân nhận ra đã bỏ lỡ uống thuốc**
   - Bệnh nhân nhận thông báo nhắc nhở nhưng không uống thuốc
   - Bệnh nhân nhận ra đã quên uống thuốc
   - Bệnh nhân không thể uống thuốc do lý do nào đó

2. **Bệnh nhân truy cập trang đánh dấu bỏ lỡ**
   - Bệnh nhân click vào menu "Đánh dấu bỏ lỡ" hoặc từ trang xác nhận uống thuốc
   - Hệ thống hiển thị trang đánh dấu bỏ lỡ thuốc

3. **Hệ thống hiển thị danh sách thuốc đã bỏ lỡ**
   - Hệ thống load danh sách thuốc đã bỏ lỡ:
     - **Thuốc hôm nay**: Thuốc cần uống hôm nay nhưng chưa xác nhận
     - **Thuốc ngày khác**: Thuốc đã bỏ lỡ trong các ngày trước
     - **Thông tin**: Tên thuốc, thời gian quy định, thời gian đã bỏ lỡ

4. **Bệnh nhân chọn thuốc cần đánh dấu bỏ lỡ**
   - Bệnh nhân click vào thuốc cần đánh dấu
   - Hệ thống hiển thị form đánh dấu bỏ lỡ:
     - **Thông tin thuốc**: Tên, liều lượng, thời gian quy định
     - **Thời gian bỏ lỡ**: Ngày và giờ bỏ lỡ thuốc
     - **Lý do bỏ lỡ**: Dropdown với các lý do phổ biến
     - **Ghi chú**: Mô tả chi tiết lý do (tùy chọn)

5. **Bệnh nhân chọn lý do bỏ lỡ thuốc**
   - Bệnh nhân chọn từ danh sách lý do:
     - **Quên**: Quên uống thuốc
     - **Không có thuốc**: Hết thuốc, mất thuốc
     - **Phản ứng phụ**: Gặp tác dụng phụ
     - **Bệnh khác**: Bị bệnh khác, không thể uống
     - **Lý do khác**: Lý do khác không có trong danh sách
   - Bệnh nhân có thể nhập ghi chú chi tiết

6. **Bệnh nhân xác nhận đánh dấu bỏ lỡ**
   - Bệnh nhân xem lại thông tin và click "Xác nhận bỏ lỡ"
   - Hệ thống hiển thị dialog xác nhận:
     - Thông tin thuốc đã bỏ lỡ
     - Lý do bỏ lỡ
     - Cảnh báo về tác động của việc bỏ lỡ thuốc
   - Bệnh nhân xác nhận và click "Lưu"

7. **Hệ thống xử lý đánh dấu bỏ lỡ**
   - Hệ thống validate dữ liệu
   - Hệ thống tạo AdherenceLog với trạng thái MISSED
   - Hệ thống cập nhật trạng thái thuốc thành "Đã bỏ lỡ"
   - Hệ thống gửi thông báo cho bác sĩ
   - Hệ thống hiển thị thông báo thành công

8. **Bệnh nhân có thể xem lịch sử bỏ lỡ**
   - Bệnh nhân click vào tab "Lịch sử bỏ lỡ"
   - Hệ thống hiển thị:
     - Danh sách các lần bỏ lỡ thuốc
     - Thời gian bỏ lỡ
     - Lý do bỏ lỡ
     - Ghi chú
     - Tác động của việc bỏ lỡ

9. **Bệnh nhân có thể nhận khuyến nghị**
   - Hệ thống hiển thị khuyến nghị dựa trên lý do bỏ lỡ:
     - **Quên**: Gợi ý đặt nhắc nhở, uống thuốc cùng bữa ăn
     - **Không có thuốc**: Gợi ý liên hệ bác sĩ, mua thuốc
     - **Phản ứng phụ**: Gợi ý liên hệ bác sĩ ngay lập tức
     - **Bệnh khác**: Gợi ý tham khảo ý kiến bác sĩ

## Alternative Flows

### A1: Bệnh nhân muốn uống thuốc muộn
- **Trigger**: Bệnh nhân nhận ra có thể uống thuốc muộn
- **Action**: Hệ thống hiển thị tùy chọn "Uống thuốc muộn"
- **Return**: Chuyển đến UC-PATIENT-003 (Xác nhận uống thuốc muộn)

### A2: Bệnh nhân bỏ lỡ thuốc nhiều lần
- **Trigger**: Bệnh nhân bỏ lỡ thuốc nhiều lần liên tiếp
- **Action**: Hệ thống hiển thị cảnh báo "Bạn đã bỏ lỡ thuốc nhiều lần, có thể ảnh hưởng đến hiệu quả điều trị"
- **Return**: Gợi ý liên hệ bác sĩ

### A3: Thuốc quan trọng bị bỏ lỡ
- **Trigger**: Bệnh nhân bỏ lỡ thuốc quan trọng (theo đánh giá của bác sĩ)
- **Action**: Hệ thống hiển thị cảnh báo đỏ "Thuốc quan trọng, cần liên hệ bác sĩ ngay"
- **Return**: Hiển thị số điện thoại bác sĩ và nút "Gọi bác sĩ"

## Postconditions
- AdherenceLog được tạo với trạng thái MISSED
- Trạng thái thuốc được cập nhật thành "Đã bỏ lỡ"
- Thông báo được gửi cho bác sĩ
- Lịch sử bỏ lỡ được cập nhật
- Khuyến nghị được hiển thị
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể đánh dấu bỏ lỡ thuốc
2. Bệnh nhân chỉ có thể đánh dấu thuốc của mình
3. Đánh dấu bỏ lỡ phải có lý do rõ ràng
4. Không thể đánh dấu thuốc đã hết hạn
5. Bỏ lỡ thuốc quan trọng cần được thông báo ngay cho bác sĩ
6. Lịch sử bỏ lỡ không thể chỉnh sửa

## Data Requirements
### Input Data
- **Đánh dấu bỏ lỡ**: prescriptionId, prescriptionItemId, missedAt, reason, notes
- **Lịch sử**: patientId, startDate, endDate

### Output Data
- AdherenceLog đã tạo
- Trạng thái thuốc đã cập nhật
- Lịch sử bỏ lỡ
- Khuyến nghị
- Thông báo cho bác sĩ
- Cảnh báo (nếu có)

## API Endpoints
- `POST /patient/prescriptions/:id/mark-missed` - Đánh dấu bỏ lỡ thuốc
- `GET /patient/prescriptions/:id/missed-logs` - Lấy lịch sử bỏ lỡ
- `GET /patient/prescriptions/:id/missed-recommendations` - Lấy khuyến nghị
- `GET /patient/prescriptions/missed-today` - Lấy thuốc đã bỏ lỡ hôm nay
- `POST /patient/prescriptions/:id/contact-doctor` - Liên hệ bác sĩ

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **403 Forbidden**: Không thể đánh dấu thuốc này
- **404 Not Found**: Thuốc không tồn tại
- **422 Unprocessable Entity**: Đánh dấu bỏ lỡ không hợp lệ
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Bệnh nhân có thể đánh dấu bỏ lỡ thuốc thành công
- Lý do bỏ lỡ được ghi lại đầy đủ
- Cảnh báo được hiển thị khi cần thiết
- Khuyến nghị hữu ích và phù hợp
- Thông báo được gửi cho bác sĩ
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Notifications
- Module Users
- Database Service
