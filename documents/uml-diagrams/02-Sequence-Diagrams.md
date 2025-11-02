# UML Sequence Diagrams - Medical Management System

## Tổng Quan
Sơ đồ tuần tự UML mô tả luồng tương tác giữa các đối tượng trong các use case quan trọng của hệ thống quản lý y tế.

## 1. Sequence Diagram - Kê Đơn Thuốc Điện Tử

```mermaid
sequenceDiagram
    participant D as Doctor
    participant DC as DoctorController
    participant PS as PrescriptionService
    participant NS as NotificationService
    participant DB as Database
    participant P as Patient
    participant WS as WebSocket

    D->>DC: POST /doctor/prescriptions
    Note over D,DC: Tạo đơn thuốc mới

    DC->>PS: createPrescription(prescriptionData)
    Note over DC,PS: Validate và tạo đơn thuốc

    PS->>DB: validatePatient(patientId)
    DB-->>PS: Patient exists & is PATIENT

    PS->>DB: validateDoctor(doctorId)
    DB-->>PS: Doctor exists & is DOCTOR

    PS->>DB: validateMedications(medicationIds)
    DB-->>PS: Medications exist & are active

    PS->>DB: createPrescription(prescriptionData)
    DB-->>PS: Prescription created

    PS->>DB: createPrescriptionItems(items)
    DB-->>PS: PrescriptionItems created

    PS-->>DC: Prescription created successfully

    DC->>NS: sendPrescriptionNotification(patientId, prescriptionId)
    Note over DC,NS: Gửi thông báo cho bệnh nhân

    NS->>WS: sendToPatient(patientId, notification)
    WS-->>P: Real-time notification

    NS->>DB: createAlert(alertData)
    DB-->>NS: Alert created

    DC-->>D: 201 Created + Prescription data

    Note over D,P: Đơn thuốc đã được tạo và thông báo đã gửi
```

## 2. Sequence Diagram - Xác Nhận Uống Thuốc

```mermaid
sequenceDiagram
    participant P as Patient
    participant PC as PatientController
    participant PS as PrescriptionService
    participant NS as NotificationService
    participant DB as Database
    participant D as Doctor
    participant WS as WebSocket

    P->>PC: POST /patient/prescriptions/:id/confirm-taken
    Note over P,PC: Xác nhận đã uống thuốc

    PC->>PS: confirmMedicationTaken(prescriptionId, data)
    Note over PC,PS: Xử lý xác nhận uống thuốc

    PS->>DB: getPrescription(prescriptionId)
    DB-->>PS: Prescription data

    PS->>DB: validatePrescriptionStatus(prescriptionId)
    DB-->>PS: Prescription is ACTIVE

    PS->>DB: createAdherenceLog(logData)
    Note over PS,DB: Tạo nhật ký tuân thủ
    DB-->>PS: AdherenceLog created

    PS->>DB: updatePrescriptionStatus(prescriptionId)
    DB-->>PS: Status updated

    PS-->>PC: Confirmation successful

    PC->>NS: sendConfirmationNotification(doctorId, patientId)
    Note over PC,NS: Gửi thông báo cho bác sĩ

    NS->>WS: sendToDoctor(doctorId, notification)
    WS-->>D: Real-time notification

    NS->>DB: createAlert(alertData)
    DB-->>NS: Alert created

    PC-->>P: 200 OK + Confirmation data

    Note over P,D: Bệnh nhân đã xác nhận uống thuốc, bác sĩ nhận thông báo
```

## 3. Sequence Diagram - Gửi Nhắc Nhở Uống Thuốc

```mermaid
sequenceDiagram
    participant C as CronJob
    participant MS as MedicationScheduler
    participant NS as NotificationService
    participant DB as Database
    participant P as Patient
    participant WS as WebSocket
    participant ES as EmailService
    participant PS as PushService

    C->>MS: @Cron(EVERY_MINUTE)
    Note over C,MS: Cron job chạy mỗi phút

    MS->>DB: getUpcomingMedications(currentTime)
    Note over MS,DB: Lấy thuốc sắp uống
    DB-->>MS: List of upcoming medications

    loop For each upcoming medication
        MS->>DB: checkPatientOnlineStatus(patientId)
        DB-->>MS: Patient status

        MS->>NS: createMedicationReminder(patientId, medicationData)
        Note over MS,NS: Tạo nhắc nhở uống thuốc

        NS->>DB: createAlert(alertData)
        DB-->>NS: Alert created

        par Send multiple notifications
            NS->>WS: sendToPatient(patientId, reminder)
            WS-->>P: Real-time notification
        and
            NS->>PS: sendPushNotification(patientId, reminder)
            PS-->>P: Push notification
        and
            NS->>ES: sendEmailReminder(patientId, reminder)
            ES-->>P: Email notification
        end

        NS-->>MS: Reminder sent successfully
    end

    MS->>DB: logReminderActivity(reminderCount)
    DB-->>MS: Log saved

    MS-->>C: Reminder process completed

    Note over C,P: Tất cả nhắc nhở đã được gửi qua nhiều kênh
```

## 4. Sequence Diagram - Tạo Cảnh Báo Tuân Thủ Thấp

```mermaid
sequenceDiagram
    participant C as CronJob
    participant AS as AdherenceScheduler
    participant RS as ReportService
    participant NS as NotificationService
    participant DB as Database
    participant D as Doctor
    participant WS as WebSocket
    participant ES as EmailService

    C->>AS: @Cron('0 9 * * *')
    Note over C,AS: Cron job chạy hàng ngày lúc 9:00

    AS->>DB: getActivePatients()
    Note over AS,DB: Lấy danh sách bệnh nhân đang điều trị
    DB-->>AS: List of active patients

    loop For each active patient
        AS->>RS: calculateAdherenceRate(patientId, 7days)
        Note over AS,RS: Tính tỷ lệ tuân thủ 7 ngày gần nhất
        RS->>DB: getAdherenceLogs(patientId, 7days)
        DB-->>RS: AdherenceLogs data
        RS->>RS: calculateRate(takenDoses, totalDoses)
        RS-->>AS: Adherence rate percentage

        alt Adherence rate < 70%
            AS->>DB: checkExistingAlert(patientId, LOW_ADHERENCE)
            DB-->>AS: No existing alert in 24h

            AS->>NS: createLowAdherenceAlert(patientId, doctorId, rate)
            Note over AS,NS: Tạo cảnh báo tuân thủ thấp

            NS->>DB: createAlert(alertData)
            DB-->>NS: Alert created

            NS->>WS: sendToDoctor(doctorId, alert)
            WS-->>D: Real-time alert

            NS->>ES: sendEmailAlert(doctorId, alert)
            ES-->>D: Email alert

            NS-->>AS: Alert sent successfully
        else Adherence rate >= 70%
            AS->>AS: Skip patient (good adherence)
        end
    end

    AS->>DB: logAdherenceCheck(checkedPatients, alertsCreated)
    DB-->>AS: Log saved

    AS-->>C: Adherence check completed

    Note over C,D: Cảnh báo tuân thủ thấp đã được gửi cho bác sĩ
```

## 5. Sequence Diagram - WebSocket Connection Management

```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocketGateway
    participant AS as AuthService
    participant NS as NotificationService
    participant DB as Database
    participant RM as RoomManager

    C->>WS: WebSocket connection request
    Note over C,WS: Client kết nối WebSocket

    WS->>AS: validateToken(token)
    Note over WS,AS: Xác thực JWT token
    AS->>DB: getUserByToken(token)
    DB-->>AS: User data
    AS-->>WS: User validated

    WS->>RM: joinUserToRooms(user)
    Note over WS,RM: Join user vào các rooms

    RM->>RM: joinRoom(user, "user_role")
    RM->>RM: joinRoom(user, "user_id")
    RM->>RM: joinRoom(user, "prescription_ids")

    RM-->>WS: User joined rooms successfully

    WS-->>C: Connection established
    Note over C,WS: Kết nối thành công

    %% Notification flow
    NS->>WS: sendNotification(roomId, message)
    Note over NS,WS: Gửi thông báo đến room

    WS->>WS: broadcastToRoom(roomId, message)
    WS-->>C: Real-time notification

    %% Disconnect flow
    C->>WS: Disconnect
    Note over C,WS: Client ngắt kết nối

    WS->>RM: leaveUserFromRooms(user)
    RM->>RM: leaveRoom(user, "user_role")
    RM->>RM: leaveRoom(user, "user_id")
    RM->>RM: leaveRoom(user, "prescription_ids")

    RM-->>WS: User left rooms successfully

    WS->>DB: logDisconnection(userId, timestamp)
    DB-->>WS: Log saved

    WS-->>C: Connection closed

    Note over C,WS: Kết nối đã được đóng và cleanup hoàn tất
```

## 6. Sequence Diagram - Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AuthController
    participant AS as AuthService
    participant US as UserService
    participant DB as Database
    participant JWT as JWTService

    C->>AC: POST /auth/login
    Note over C,AC: Đăng nhập

    AC->>AS: login(credentials)
    Note over AC,AS: Xử lý đăng nhập

    AS->>US: validateUser(phoneNumber, password)
    Note over AS,US: Validate thông tin đăng nhập

    US->>DB: findUserByPhone(phoneNumber)
    DB-->>US: User data

    US->>US: comparePassword(password, hashedPassword)
    US-->>AS: User validated

    AS->>JWT: generateAccessToken(user)
    Note over AS,JWT: Tạo access token
    JWT-->>AS: Access token

    AS->>JWT: generateRefreshToken(user)
    Note over AS,JWT: Tạo refresh token
    JWT-->>AS: Refresh token

    AS->>DB: saveRefreshToken(userId, refreshToken)
    DB-->>AS: Token saved

    AS-->>AC: AuthResult with tokens

    AC->>AC: setCookie(refreshToken)
    Note over AC,AC: Set refresh token cookie

    AC-->>C: 200 OK + Access token + User data

    %% Token refresh flow
    C->>AC: POST /auth/refresh
    Note over C,AC: Refresh token

    AC->>AS: refreshToken(refreshToken)
    AS->>DB: validateRefreshToken(refreshToken)
    DB-->>AS: Token valid

    AS->>JWT: generateAccessToken(user)
    JWT-->>AS: New access token

    AS-->>AC: New access token
    AC-->>C: 200 OK + New access token

    Note over C,AC: Authentication flow hoàn tất
```

## 7. Sequence Diagram - Admin Quản Lý Người Dùng

```mermaid
sequenceDiagram
    participant A as Admin
    participant AC as AdminController
    participant US as UserService
    participant VS as ValidationService
    participant DB as Database
    participant NS as NotificationService

    A->>AC: GET /admin/users?page=1&limit=10
    Note over A,AC: Lấy danh sách người dùng

    AC->>US: getUsers(filters, pagination)
    US->>DB: findUsers(filters, pagination)
    DB-->>US: Users list
    US-->>AC: Users with pagination

    AC-->>A: 200 OK + Users list

    %% Create user flow
    A->>AC: POST /admin/users
    Note over A,AC: Tạo người dùng mới

    AC->>VS: validateUserData(userData)
    VS-->>AC: Validation passed

    AC->>US: createUser(userData)
    US->>DB: checkPhoneNumberExists(phoneNumber)
    DB-->>US: PhoneNumber not exists

    US->>US: hashPassword(password)
    US->>DB: createUser(userData)
    DB-->>US: User created

    US->>NS: sendWelcomeNotification(userId)
    NS-->>US: Notification sent

    US-->>AC: User created successfully
    AC-->>A: 201 Created + User data

    %% Update user flow
    A->>AC: PATCH /admin/users/:id
    Note over A,AC: Cập nhật người dùng

    AC->>US: updateUser(id, userData)
    US->>DB: getUserById(id)
    DB-->>US: User exists

    US->>VS: validateUpdateData(userData)
    VS-->>US: Validation passed

    US->>DB: updateUser(id, userData)
    DB-->>US: User updated

    US-->>AC: User updated successfully
    AC-->>A: 200 OK + Updated user data

    %% Delete user flow
    A->>AC: DELETE /admin/users/:id
    Note over A,AC: Xóa người dùng

    AC->>US: deleteUser(id)
    US->>DB: checkUserCanBeDeleted(id)
    DB-->>US: User can be deleted

    US->>DB: softDeleteUser(id)
    DB-->>US: User deleted

    US-->>AC: User deleted successfully
    AC-->>A: 200 OK

    Note over A,DB: Quản lý người dùng hoàn tất
```

## 8. Sequence Diagram - Bác Sĩ Chỉnh Sửa Đơn Thuốc

```mermaid
sequenceDiagram
    participant D as Doctor
    participant DC as DoctorController
    participant PS as PrescriptionService
    participant NS as NotificationService
    participant DB as Database
    participant P as Patient
    participant WS as WebSocket

    D->>DC: PATCH /doctor/prescriptions/:id
    Note over D,DC: Chỉnh sửa đơn thuốc

    DC->>PS: updatePrescription(id, prescriptionData)
    Note over DC,PS: Cập nhật đơn thuốc

    PS->>DB: getPrescription(id)
    DB-->>PS: Prescription data

    PS->>DB: validatePrescriptionStatus(id)
    DB-->>PS: Prescription is ACTIVE

    PS->>DB: validateDoctorCanEdit(doctorId, prescriptionId)
    DB-->>PS: Doctor can edit

    PS->>DB: updatePrescription(id, prescriptionData)
    DB-->>PS: Prescription updated

    PS->>DB: updatePrescriptionItems(id, items)
    DB-->>PS: PrescriptionItems updated

    PS-->>DC: Prescription updated successfully

    DC->>NS: sendPrescriptionUpdateNotification(patientId, prescriptionId)
    Note over DC,NS: Gửi thông báo cập nhật

    NS->>WS: sendToPatient(patientId, notification)
    WS-->>P: Real-time notification

    NS->>DB: createAlert(alertData)
    DB-->>NS: Alert created

    DC-->>D: 200 OK + Updated prescription data

    Note over D,P: Đơn thuốc đã được cập nhật và thông báo đã gửi
```

## 9. Sequence Diagram - Bệnh Nhân Đánh Dấu Bỏ Lỡ Thuốc

```mermaid
sequenceDiagram
    participant P as Patient
    participant PC as PatientController
    participant PS as PrescriptionService
    participant NS as NotificationService
    participant DB as Database
    participant D as Doctor
    participant WS as WebSocket

    P->>PC: POST /patient/prescriptions/:id/mark-missed
    Note over P,PC: Đánh dấu bỏ lỡ thuốc

    PC->>PS: markMedicationMissed(prescriptionId, data)
    Note over PC,PS: Xử lý đánh dấu bỏ lỡ

    PS->>DB: getPrescription(prescriptionId)
    DB-->>PS: Prescription data

    PS->>DB: validatePrescriptionStatus(prescriptionId)
    DB-->>PS: Prescription is ACTIVE

    PS->>DB: createAdherenceLog(logData)
    Note over PS,DB: Tạo nhật ký với status MISSED
    DB-->>PS: AdherenceLog created with MISSED status

    PS->>DB: updatePrescriptionStatus(prescriptionId)
    DB-->>PS: Status updated

    PS->>DB: calculateAdherenceRate(prescriptionId)
    DB-->>PS: Adherence rate percentage

    PS-->>PC: Missed medication marked successfully

    PC->>NS: sendMissedMedicationAlert(doctorId, patientId, prescriptionId)
    Note over PC,NS: Gửi cảnh báo cho bác sĩ

    NS->>WS: sendToDoctor(doctorId, alert)
    WS-->>D: Real-time alert

    NS->>DB: createAlert(alertData)
    DB-->>NS: Alert created

    PC-->>P: 200 OK + Confirmation data

    Note over P,D: Bệnh nhân đã đánh dấu bỏ lỡ thuốc, bác sĩ nhận cảnh báo
```

## Mô Tả Chi Tiết

### 1. Kê Đơn Thuốc Điện Tử
- **Mục đích**: Mô tả quy trình bác sĩ tạo đơn thuốc mới
- **Các bước chính**:
  1. Doctor gửi request tạo đơn thuốc
  2. Validate thông tin bệnh nhân, bác sĩ, thuốc
  3. Tạo Prescription và PrescriptionItems
  4. Gửi thông báo real-time cho bệnh nhân
  5. Tạo Alert record

### 2. Xác Nhận Uống Thuốc
- **Mục đích**: Mô tả quy trình bệnh nhân xác nhận đã uống thuốc
- **Các bước chính**:
  1. Patient gửi request xác nhận uống thuốc
  2. Validate đơn thuốc và trạng thái
  3. Tạo AdherenceLog record
  4. Cập nhật trạng thái đơn thuốc
  5. Gửi thông báo cho bác sĩ

### 3. Gửi Nhắc Nhở Uống Thuốc
- **Mục đích**: Mô tả quy trình hệ thống tự động gửi nhắc nhở
- **Các bước chính**:
  1. Cron job chạy mỗi phút
  2. Tìm thuốc sắp uống
  3. Tạo Alert record
  4. Gửi thông báo qua nhiều kênh (WebSocket, Push, Email)
  5. Ghi log hoạt động

### 4. Tạo Cảnh Báo Tuân Thủ Thấp
- **Mục đích**: Mô tả quy trình hệ thống tự động tạo cảnh báo
- **Các bước chính**:
  1. Cron job chạy hàng ngày lúc 9:00
  2. Tính tỷ lệ tuân thủ cho từng bệnh nhân
  3. Tạo cảnh báo nếu tỷ lệ < 70%
  4. Gửi cảnh báo cho bác sĩ
  5. Ghi log hoạt động

### 5. WebSocket Connection Management
- **Mục đích**: Mô tả quy trình quản lý kết nối WebSocket
- **Các bước chính**:
  1. Client kết nối WebSocket
  2. Xác thực JWT token
  3. Join user vào các rooms phù hợp
  4. Gửi/nhận thông báo real-time
  5. Cleanup khi disconnect

### 6. Authentication Flow
- **Mục đích**: Mô tả quy trình đăng nhập và refresh token
- **Các bước chính**:
  1. Client gửi thông tin đăng nhập
  2. Validate thông tin user
  3. Tạo access token và refresh token
  4. Set refresh token cookie
  5. Trả về access token và user data

## Lợi Ích Của Sequence Diagrams

1. **Hiểu rõ luồng**: Giúp hiểu rõ luồng tương tác giữa các đối tượng
2. **Debug**: Dễ dàng debug và tìm lỗi trong quy trình
3. **Thiết kế**: Hỗ trợ thiết kế API và service interactions
4. **Tài liệu hóa**: Tài liệu hóa quy trình nghiệp vụ
5. **Giao tiếp**: Giúp giao tiếp giữa team về quy trình hệ thống
