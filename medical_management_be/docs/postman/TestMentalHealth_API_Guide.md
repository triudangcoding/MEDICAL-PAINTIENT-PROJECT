# Hướng dẫn sử dụng TestMentalHealth API Collection

## Cài đặt

1. **Import Collection vào Postman:**
   - Mở Postman
   - Click "Import" 
   - Chọn file `TestMentalHealth_API_Collection.json`
   - Collection sẽ được thêm vào Postman

2. **Thiết lập Environment Variables:**
   - Tạo Environment mới hoặc sử dụng Environment hiện có
   - Thiết lập các biến sau:
     - `base_url`: URL của server (ví dụ: `http://localhost:3000`)
     - `question_id`: ID của câu hỏi để test
     - `user_id`: ID của user để test

## Các API Endpoints

### 1. Quản lý câu hỏi test

#### 1.1 Lấy danh sách câu hỏi
- **Method:** GET
- **URL:** `{{base_url}}/test-mental-health`
- **Mô tả:** Lấy tất cả câu hỏi test được sắp xếp theo index
- **Response:** Danh sách câu hỏi với thông tin: id, index, name, description, createdAt, updatedAt

#### 1.2 Tạo câu hỏi mới
- **Method:** POST
- **URL:** `{{base_url}}/test-mental-health`
- **Body:**
  ```json
  {
    "index": 1,
    "name": "Bạn có thường xuyên cảm thấy lo lắng không?",
    "description": "Câu hỏi đánh giá mức độ lo lắng của người dùng"
  }
  ```
- **Validation:**
  - `index`: Số nguyên dương, phải unique
  - `name`: Không được để trống
  - `description`: Không được để trống

#### 1.3 Lấy câu hỏi theo ID
- **Method:** GET
- **URL:** `{{base_url}}/test-mental-health/{{question_id}}`
- **Mô tả:** Lấy thông tin chi tiết của một câu hỏi
- **Response:** Thông tin câu hỏi hoặc lỗi 404 nếu không tìm thấy

#### 1.4 Cập nhật câu hỏi
- **Method:** PATCH
- **URL:** `{{base_url}}/test-mental-health/{{question_id}}`
- **Body:** Tất cả fields đều optional
  ```json
  {
    "index": 2,
    "name": "Bạn có thường xuyên cảm thấy căng thẳng không?",
    "description": "Câu hỏi đánh giá mức độ căng thẳng của người dùng"
  }
  ```
- **Lưu ý:** Có thể thay đổi index, nhưng index mới phải unique

#### 1.5 Xóa câu hỏi
- **Method:** DELETE
- **URL:** `{{base_url}}/test-mental-health/{{question_id}}`
- **Mô tả:** Xóa câu hỏi theo ID
- **Response:** Thông tin câu hỏi đã xóa hoặc lỗi 404

### 2. Quản lý kết quả test của user

#### 2.1 Tạo kết quả test cho user
- **Method:** POST
- **URL:** `{{base_url}}/test-mental-health/user-test`
- **Body:**
  ```json
  {
    "userId": "{{user_id}}",
    "testDate": "2024-01-15T10:30:00.000Z",
    "result": true
  }
  ```
- **Fields:**
  - `userId`: Bắt buộc, UUID của user
  - `testDate`: Optional, ISO string format, default: now
  - `result`: Optional, boolean, default: false

#### 2.2 Tạo kết quả test cho user (theo list)
- **Method:** POST
- **URL:** `{{base_url}}/test-mental-health/user-test-list`
- **Body:**
  ```json
  {
    "userId": "{{user_id}}",
    "testDate": "2024-01-15T10:30:00.000Z",
    "data": [
      {
        "questionId": "{{question_id}}",
        "result": true
      },
      {
        "questionId": "{{question_id_2}}",
        "result": false
      }
    ]
  }
  ```
- **Fields:**
  - `userId`: Bắt buộc, UUID của user
  - `testDate`: Optional, ISO string format, default: now
  - `data`: Bắt buộc, array chứa các object với questionId và result
    - `questionId`: UUID của câu hỏi
    - `result`: Boolean (true/false)

#### 2.3 Lấy kết quả test của user
- **Method:** GET
- **URL:** `{{base_url}}/test-mental-health/user/{{user_id}}`
- **Mô tả:** Lấy tất cả kết quả test của một user
- **Response:** 
  ```json
  {
    "message": "Lấy kết quả test thành công",
    "data": [
      {
        "id": "test-uuid",
        "userId": "user-uuid",
        "testDate": "2024-01-15T10:30:00.000Z",
        "result": true,
        "user": {
          "id": "user-uuid",
          "phoneNumber": "0123456789",
          "fullName": "Nguyễn Văn A"
        }
      }
    ]
  }
  ```

## Cách sử dụng

### Bước 1: Thiết lập Environment
1. Tạo Environment mới trong Postman
2. Thiết lập `base_url` = `http://localhost:3000`
3. Chọn Environment này

### Bước 2: Test tạo câu hỏi
1. Chạy API "Tạo câu hỏi mới"
2. Copy `id` từ response
3. Cập nhật biến `question_id` trong Environment

### Bước 3: Test các API khác
1. Sử dụng `{{question_id}}` để test các API liên quan đến câu hỏi
2. Sử dụng `{{user_id}}` để test các API liên quan đến user

## Error Handling

### Các lỗi thường gặp:

1. **400 Bad Request:**
   - Validation error (index không hợp lệ, name rỗng, etc.)
   - Format date không đúng

2. **404 Not Found:**
   - Câu hỏi không tồn tại
   - User không tồn tại

3. **409 Conflict:**
   - Index câu hỏi đã tồn tại
   - Mã voucher đã tồn tại

4. **500 Internal Server Error:**
   - Lỗi server, database

## Tips

1. **Test theo thứ tự:** Tạo câu hỏi trước, sau đó test các API khác
2. **Kiểm tra Response:** Luôn kiểm tra status code và response body
3. **Sử dụng Variables:** Tận dụng Environment variables để dễ dàng thay đổi giá trị
4. **Test Edge Cases:** Test với dữ liệu không hợp lệ để kiểm tra validation
5. **Check Logs:** Xem server logs nếu có lỗi để debug

## Troubleshooting

### Vấn đề thường gặp:

1. **Connection refused:**
   - Kiểm tra server có đang chạy không
   - Kiểm tra `base_url` có đúng không

2. **Validation errors:**
   - Kiểm tra format của request body
   - Đảm bảo các required fields được truyền

3. **404 errors:**
   - Kiểm tra ID có tồn tại trong database không
   - Kiểm tra URL có đúng không
