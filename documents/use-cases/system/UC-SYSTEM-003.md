# UC-SYSTEM-003: Xử Lý WebSocket Connections

## Thông Tin Cơ Bản
- **ID**: UC-SYSTEM-003
- **Tên**: Xử Lý WebSocket Connections
- **Actor**: System (Hệ thống)
- **Mô tả**: Hệ thống quản lý kết nối WebSocket cho real-time notifications
- **Priority**: High
- **Complexity**: High

## Preconditions
- Hệ thống đang hoạt động bình thường
- WebSocket server được khởi động
- Client có thể kết nối đến WebSocket endpoint
- Hệ thống authentication hoạt động bình thường

## Main Flow
1. **Client kết nối WebSocket**
   - Client gửi request kết nối WebSocket
   - Hệ thống nhận connection request
   - Hệ thống bắt đầu quá trình authentication

2. **Hệ thống xác thực kết nối**
   - Hệ thống kiểm tra JWT token từ client
   - Validate token với AuthService
   - Lấy thông tin user từ token
   - Kiểm tra quyền truy cập của user

3. **Hệ thống thiết lập kết nối**
   - Nếu authentication thành công:
     - Tạo WebSocket connection
     - Lưu thông tin user vào socket
     - Join user vào room tương ứng với role
     - Gửi thông báo kết nối thành công
   - Nếu authentication thất bại:
     - Từ chối kết nối
     - Gửi thông báo lỗi
     - Đóng connection

4. **Hệ thống quản lý rooms**
   - **Admin room**: Tất cả admin được join vào room "admin"
   - **Doctor room**: Bác sĩ được join vào room "doctor" và room riêng theo ID
   - **Patient room**: Bệnh nhân được join vào room "patient" và room riêng theo ID
   - **Prescription room**: User được join vào room theo prescriptionId

5. **Hệ thống xử lý real-time notifications**

   **5.1. Gửi thông báo nhắc nhở thuốc**
   - Hệ thống gửi thông báo đến room của bệnh nhân
   - Thông báo chứa thông tin thuốc cần uống
   - Bệnh nhân nhận thông báo real-time

   **5.2. Gửi cảnh báo tuân thủ thấp**
   - Hệ thống gửi cảnh báo đến room của bác sĩ
   - Cảnh báo chứa thông tin bệnh nhân có tỷ lệ tuân thủ thấp
   - Bác sĩ nhận cảnh báo real-time

   **5.3. Gửi thông báo cập nhật đơn thuốc**
   - Hệ thống gửi thông báo đến room của bệnh nhân
   - Thông báo chứa thông tin thay đổi đơn thuốc
   - Bệnh nhân nhận thông báo cập nhật

6. **Hệ thống xử lý disconnect**
   - Khi client disconnect:
     - Hệ thống nhận disconnect event
     - Xóa thông tin user khỏi socket
     - Leave user khỏi các rooms
     - Ghi log disconnect
     - Cleanup resources

7. **Hệ thống quản lý connection pool**
   - Theo dõi số lượng connections hiện tại
   - Giới hạn số lượng connections tối đa
   - Xử lý connection timeout
   - Cleanup connections không hoạt động

8. **Hệ thống ghi log hoạt động**
   - Ghi log mỗi connection/disconnection
   - Ghi log các thông báo đã gửi
   - Ghi log các lỗi WebSocket
   - Ghi log performance metrics

## Alternative Flows

### A1: Token hết hạn
- **Trigger**: JWT token đã hết hạn
- **Action**: Hệ thống từ chối kết nối và yêu cầu refresh token
- **Return**: Client cần refresh token và kết nối lại

### A2: User không có quyền
- **Trigger**: User không có quyền truy cập WebSocket
- **Action**: Hệ thống từ chối kết nối
- **Return**: Client không thể kết nối

### A3: Connection timeout
- **Trigger**: Connection không hoạt động trong thời gian dài
- **Action**: Hệ thống tự động đóng connection
- **Return**: Client cần kết nối lại

### A4: Server overload
- **Trigger**: Số lượng connections vượt quá giới hạn
- **Action**: Hệ thống từ chối kết nối mới
- **Return**: Client nhận thông báo "Server đang quá tải"

### A5: Network error
- **Trigger**: Có lỗi mạng khi gửi thông báo
- **Action**: Hệ thống retry gửi thông báo
- **Return**: Thông báo được gửi lại hoặc bỏ qua

## Postconditions
- WebSocket connection được thiết lập thành công
- User được join vào các rooms phù hợp
- Real-time notifications hoạt động bình thường
- Connection được quản lý hiệu quả
- Log hoạt động được ghi lại

## Business Rules
1. Chỉ user đã đăng nhập mới có thể kết nối WebSocket
2. User được join vào rooms theo role và ID
3. Thông báo được gửi đến đúng room
4. Connection timeout được xử lý tự động
5. Số lượng connections có giới hạn
6. Tất cả hoạt động được ghi log

## Data Requirements
### Input Data
- **JWT Token**: accessToken
- **User Info**: userId, role, permissions
- **Room Info**: roomId, roomType
- **Message**: messageType, data, timestamp

### Output Data
- WebSocket connection
- Room membership
- Real-time notifications
- Connection status
- Log records

## API Endpoints
- `WS /socket.io` - WebSocket endpoint
- `GET /notifications/connections` - Lấy thông tin connections
- `POST /notifications/broadcast` - Broadcast thông báo
- `GET /notifications/rooms` - Lấy thông tin rooms

## Error Handling
- **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
- **403 Forbidden**: User không có quyền truy cập
- **429 Too Many Requests**: Quá nhiều connections
- **500 Internal Server Error**: Lỗi hệ thống
- **503 Service Unavailable**: WebSocket service không khả dụng

## Success Criteria
- WebSocket connections hoạt động ổn định
- Real-time notifications được gửi đúng đích
- Authentication hoạt động chính xác
- Connection management hiệu quả
- Performance tốt với số lượng lớn connections
- Error handling robust

## Dependencies
- Module Notifications
- Module Authentication
- Module Users
- WebSocket Gateway
- Socket.IO
- JWT Service
- Database Service
