# UC-PATIENT-005: Xem Lịch Sử Dùng Thuốc

## Thông Tin Cơ Bản
- **ID**: UC-PATIENT-005
- **Tên**: Xem Lịch Sử Dùng Thuốc
- **Actor**: Patient (Bệnh nhân)
- **Mô tả**: Bệnh nhân xem lịch sử dùng thuốc của mình
- **Priority**: Medium
- **Complexity**: Low

## Preconditions
- Bệnh nhân đã đăng nhập vào hệ thống
- Bệnh nhân có quyền PATIENT
- Bệnh nhân đã có lịch sử dùng thuốc
- Hệ thống đang hoạt động bình thường

## Main Flow
1. **Bệnh nhân truy cập trang lịch sử dùng thuốc**
   - Bệnh nhân click vào menu "Lịch sử dùng thuốc"
   - Hệ thống hiển thị trang lịch sử dùng thuốc

2. **Hệ thống hiển thị tổng quan lịch sử**
   - Hệ thống load tổng quan lịch sử:
     - **Tỷ lệ tuân thủ**: Phần trăm uống thuốc đúng giờ
     - **Số lần uống**: Tổng số lần đã uống thuốc
     - **Số lần bỏ lỡ**: Số lần bỏ lỡ thuốc
     - **Thời gian điều trị**: Tổng thời gian đã điều trị
     - **Đánh giá**: Tốt, Trung bình, Cần cải thiện

3. **Bệnh nhân có thể xem lịch sử theo các khoảng thời gian**

   **3.1. Lịch sử hôm nay**
   - Bệnh nhân click vào tab "Hôm nay"
   - Hệ thống hiển thị:
     - Danh sách thuốc cần uống hôm nay
     - Trạng thái uống thuốc: Đã uống, Chưa uống, Đã bỏ lỡ
     - Thời gian uống thuốc
     - Ghi chú (nếu có)

   **3.2. Lịch sử tuần này**
   - Bệnh nhân click vào tab "Tuần này"
   - Hệ thống hiển thị:
     - Lịch sử uống thuốc 7 ngày trong tuần
     - Biểu đồ tuân thủ theo ngày
     - Tổng số lần uống thuốc trong tuần
     - Tỷ lệ tuân thủ trong tuần

   **3.3. Lịch sử tháng này**
   - Bệnh nhân click vào tab "Tháng này"
   - Hệ thống hiển thị:
     - Lịch sử uống thuốc trong tháng
     - Biểu đồ tuân thủ theo ngày
     - Thống kê tổng quan tháng
     - Các ngày có tỷ lệ tuân thủ thấp

   **3.4. Lịch sử tùy chỉnh**
   - Bệnh nhân chọn khoảng thời gian tùy chỉnh
   - Hệ thống hiển thị lịch sử trong khoảng thời gian đã chọn

4. **Bệnh nhân có thể xem chi tiết từng lần uống thuốc**
   - Bệnh nhân click vào lần uống thuốc trong danh sách
   - Hệ thống hiển thị modal với thông tin chi tiết:
     - **Thông tin thuốc**: Tên thuốc, liều lượng
     - **Thời gian**: Thời gian quy định và thời gian thực tế
     - **Số lượng**: Số lượng thuốc đã uống
     - **Trạng thái**: Đúng giờ, Muộn, Bỏ lỡ
     - **Ghi chú**: Ghi chú của bệnh nhân

5. **Bệnh nhân có thể xem thống kê chi tiết**
   - Bệnh nhân click vào tab "Thống kê"
   - Hệ thống hiển thị:
     - **Biểu đồ tuân thủ**: Xu hướng tuân thủ theo thời gian
     - **Phân tích theo thuốc**: Tỷ lệ tuân thủ của từng thuốc
     - **Phân tích theo thời gian**: Tuân thủ theo các khung giờ
     - **So sánh**: So sánh tuân thủ giữa các khoảng thời gian

6. **Bệnh nhân có thể xuất báo cáo**
   - Bệnh nhân click nút "Xuất báo cáo"
   - Hệ thống hiển thị dialog chọn:
     - Khoảng thời gian
     - Loại báo cáo: Tổng quan, Chi tiết
     - Format: PDF, Excel
   - Bệnh nhân chọn và click "Xuất"
   - Hệ thống tạo file báo cáo và cho phép download

7. **Bệnh nhân có thể xem khuyến nghị**
   - Hệ thống hiển thị khuyến nghị dựa trên lịch sử:
     - **Tuân thủ tốt**: Khuyến nghị duy trì thói quen
     - **Tuân thủ trung bình**: Khuyến nghị cải thiện
     - **Tuân thủ thấp**: Khuyến nghị liên hệ bác sĩ
     - **Bỏ lỡ nhiều**: Khuyến nghị đặt nhắc nhở

## Alternative Flows

### A1: Bệnh nhân chưa có lịch sử dùng thuốc
- **Trigger**: Bệnh nhân chưa có lịch sử dùng thuốc nào
- **Action**: Hệ thống hiển thị thông báo "Bạn chưa có lịch sử dùng thuốc"
- **Return**: Hiển thị nút "Bắt đầu điều trị"

### A2: Không có dữ liệu trong khoảng thời gian
- **Trigger**: Không có dữ liệu trong khoảng thời gian đã chọn
- **Action**: Hệ thống hiển thị thông báo "Không có dữ liệu trong khoảng thời gian này"
- **Return**: Gợi ý chọn khoảng thời gian khác

### A3: Lỗi khi xuất báo cáo
- **Trigger**: Có lỗi khi tạo file báo cáo
- **Action**: Hệ thống hiển thị thông báo lỗi và cho phép thử lại
- **Return**: Bệnh nhân có thể thử lại hoặc chọn format khác

## Postconditions
- Lịch sử dùng thuốc được hiển thị đầy đủ
- Thống kê tuân thủ được hiển thị
- Báo cáo được xuất (nếu được yêu cầu)
- Khuyến nghị được hiển thị
- Log truy cập được ghi lại

## Business Rules
1. Chỉ bệnh nhân có quyền PATIENT mới có thể xem lịch sử dùng thuốc
2. Bệnh nhân chỉ có thể xem lịch sử của mình
3. Lịch sử dùng thuốc không thể chỉnh sửa
4. Thống kê tuân thủ được tính dựa trên AdherenceLog
5. Báo cáo phải chính xác và đầy đủ
6. Khuyến nghị dựa trên dữ liệu thực tế

## Data Requirements
### Input Data
- **Xem lịch sử**: patientId, timeRange
- **Xuất báo cáo**: patientId, startDate, endDate, reportType, format

### Output Data
- Lịch sử dùng thuốc
- Thống kê tuân thủ
- Biểu đồ tuân thủ
- Báo cáo đã xuất
- Khuyến nghị
- Thông báo/cảnh báo

## API Endpoints
- `GET /patient/prescriptions/history` - Lấy lịch sử dùng thuốc
- `GET /patient/prescriptions/history/today` - Lấy lịch sử hôm nay
- `GET /patient/prescriptions/history/week` - Lấy lịch sử tuần
- `GET /patient/prescriptions/history/month` - Lấy lịch sử tháng
- `GET /patient/prescriptions/history/stats` - Lấy thống kê tuân thủ
- `GET /patient/prescriptions/history/recommendations` - Lấy khuyến nghị
- `POST /patient/prescriptions/history/export` - Xuất báo cáo lịch sử

## Error Handling
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền PATIENT
- **404 Not Found**: Không có lịch sử dùng thuốc
- **500 Internal Server Error**: Lỗi hệ thống

## Success Criteria
- Lịch sử dùng thuốc được hiển thị đầy đủ và chính xác
- Thống kê tuân thủ dễ hiểu và hữu ích
- Biểu đồ tuân thủ trực quan
- Xuất báo cáo hoạt động tốt
- Khuyến nghị phù hợp và hữu ích
- Giao diện thân thiện, dễ sử dụng

## Dependencies
- Module Prescriptions
- Module Users
- Module Reports
- Database Service
