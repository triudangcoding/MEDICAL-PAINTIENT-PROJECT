## API Reference

This document lists the available APIs grouped by role. Unless marked Public, endpoints require JWT via `Authorization: Bearer <token>`.

### Ghi chú (Tiếng Việt)

- Tất cả API (trừ các API Public) yêu cầu gửi JWT qua header `Authorization: Bearer <token>`.
- Hệ thống có 3 vai trò: `ADMIN`, `DOCTOR`, `PATIENT`. Mỗi nhóm API chỉ truy cập được bởi vai trò tương ứng.
- Trạng thái người dùng `status`: `ACTIVE | INACTIVE | BLOCKED`.
- Xoá người dùng ở màn Admin là xoá mềm (cập nhật `deletedAt`). Danh sách sẽ không hiển thị user đã xoá mềm.
- Danh mục thuốc: Xoá là “vô hiệu hoá” (`isActive=false`).
- Tỉ lệ tuân thủ (adherenceRate) = số log `TAKEN` / tổng số dòng thuốc được kê (`PrescriptionItem`).
- Thời gian trong body/response dùng định dạng ISO (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Lỗi trả về theo chuẩn NestJS, ví dụ:
  ```json
  { "statusCode": 400, "message": "Thông báo lỗi", "error": "Bad Request" }
  ```

### Auth

- Purpose: Authentication for all roles.

1) POST /auth/login
   - Body:
     ```json
     { "phoneNumber": "string", "password": "string" }
     ```
   - Response:
     ```json
     {
       "accessToken": "string",
       "refreshToken": "string",
       "user": { "id": "uuid", "phoneNumber": "string", "fullName": "string", "role": "ADMIN|DOCTOR|PATIENT", "status": "ACTIVE|INACTIVE|BLOCKED" }
     }
     ```
   - Notes: Also sets `token` cookie (httpOnly) when using Fastify response.

2) POST /auth/register (Public)
   - Body:
     ```json
     { "fullName": "string", "phoneNumber": "string", "password": "string" }
     ```
   - Response: Same as login.
   - Notes: Simple flow; no email/SMS; immediate verification.

3) POST /auth/logout (Public)
   - Clears auth cookie if present.
   - Response: `{ "success": true }`

4) GET /auth/me
   - Response: The current user (from token)

### Users (Common user management)

- Purpose: User self-queries and basic admin-assisted creation.

1) GET /users/me
   - Response:
     ```json
     { "id": "uuid", "phoneNumber": "string", "fullName": "string", "role": "ADMIN|DOCTOR|PATIENT", "status": "ACTIVE|INACTIVE|BLOCKED", "profile": { ... }, "medicalHistory": { ... } }
     ```

2) POST /users (ADMIN)
   - Create user (doctor/patient) quickly.
   - Body:
     ```json
     { "fullName": "string", "phoneNumber": "string", "password": "string", "role": "DOCTOR|PATIENT" }
     ```
   - Response: Created user.

3) PATCH /users/:id (ADMIN)
   - Update user basic fields.
   - Body (any subset):
     ```json
     { "fullName": "string", "phoneNumber": "string", "password": "string", "oldPassword": "string", "role": "ADMIN|DOCTOR|PATIENT", "status": "ACTIVE|INACTIVE|BLOCKED" }
     ```
   - Response: Updated user.

4) DELETE /users/multiple (ADMIN)
   - Body:
     ```json
     { "ids": ["uuid", "uuid"] }
     ```
   - Response: Deletion summary.

5) DELETE /users/patient/multiple (ADMIN)
   - Body:
     ```json
     { "ids": ["uuid", "uuid"] }
     ```
   - Response: Deletion summary (patients only).

6) DELETE /users/:id (ADMIN)
   - Response: Soft delete is implemented via admin endpoints below; this legacy route now maps to soft-delete.

### Admin

- Purpose: Administrative management and reports.

Users Management
1) GET /admin/users (ADMIN)
   - Query: `role=DOCTOR|PATIENT` (optional), `page`, `limit`, `sortBy`, `sortOrder=asc|desc`
   - Response:
     ```json
     { "items": [/* users */], "total": 0, "page": 1, "limit": 20 }
     ```

2) POST /admin/users (ADMIN)
   - Body same as POST /users
   - Response: Created user.

3) PATCH /admin/users/:id (ADMIN)
   - Body same as PATCH /users/:id
   - Response: Updated user.

4) DELETE /admin/users/:id (ADMIN)
   - Soft delete user: sets `deletedAt` timestamp.
   - Response: Updated user with `deletedAt`.

Medications
5) GET /admin/medications (ADMIN)
   - Query: `isActive=true|false` (optional), `page`, `limit`, `sortBy`, `sortOrder=asc|desc`
   - Response:
     ```json
     { "items": [/* medications */], "total": 0, "page": 1, "limit": 20 }
     ```

6) POST /admin/medications (ADMIN)
   - Body:
     ```json
     { "name": "string", "strength": "string?", "form": "string?", "unit": "string?", "description": "string?" }
     ```
   - Response: Created medication.

7) PATCH /admin/medications/:id (ADMIN)
   - Body (any subset):
     ```json
     { "name": "string?", "strength": "string?", "form": "string?", "unit": "string?", "description": "string?", "isActive": true }
     ```
   - Response: Updated medication.

8) DELETE /admin/medications/:id (ADMIN)
   - Deactivate medication (`isActive: false`).
   - Response: Updated medication.

Reports
9) GET /admin/reports/overview (ADMIN)
   - Response:
     ```json
     { "totalPrescriptions": 0, "activePatients": 0, "adherenceRate": 0.0 }
     ```

### Doctor

- Purpose: Manage patients, prescriptions, and monitor adherence/alerts.

Patients
1) GET /doctor/patients (DOCTOR)
   - Query: `q=string` (optional search by name), `page`, `limit`, `sortBy`, `sortOrder=asc|desc`
   - Response:
     ```json
     { "items": [/* patients */], "total": 0, "page": 1, "limit": 20 }
     ```

2) GET /doctor/patients/:id (DOCTOR)
   - Response: Patient with `profile` and `medicalHistory`.

3) POST /doctor/patients (DOCTOR)
   - Body:
     ```json
     {
       "fullName": "string",
       "phoneNumber": "string",
       "password": "string",
       "profile": { "gender": "MALE|FEMALE|OTHER?", "birthDate": "ISO?", "address": "string?" }
     }
     ```
   - Response: Created patient with profile/history.

4) PUT /doctor/patients/:id/profile (DOCTOR)
   - Body:
     ```json
     { "gender": "MALE|FEMALE|OTHER?", "birthDate": "ISO?", "address": "string?" }
     ```
   - Response: Updated patient object.

5) PUT /doctor/patients/:id/history (DOCTOR)
   - Body:
     ```json
     { "conditions": ["string"], "allergies": ["string"], "surgeries": ["string"], "familyHistory": "string?", "lifestyle": "string?", "currentMedications": ["string"], "notes": "string?" }
     ```
   - Response: Updated patient object.

Prescriptions
6) POST /doctor/prescriptions (DOCTOR)
   - Body:
     ```json
     {
       "patientId": "uuid",
       "items": [
         { "medicationId": "uuid", "dosage": "string", "frequencyPerDay": 1, "timesOfDay": ["HH:mm"], "durationDays": 7, "route": "string?", "instructions": "string?" }
       ],
       "notes": "string?"
     }
     ```
   - Response: Created prescription with items.

7) GET /doctor/prescriptions (DOCTOR)
   - Query: `page`, `limit`, `sortBy`, `sortOrder=asc|desc`
   - Response:
     ```json
     { "items": [/* prescriptions */], "total": 0, "page": 1, "limit": 20 }
     ```

8) GET /doctor/prescriptions/:id (DOCTOR)
   - Response: Prescription with items and patient/doctor info.

9) PUT /doctor/prescriptions/:id (DOCTOR)
   - Body (replace items if provided):
     ```json
     { "notes": "string?", "items": [ { "medicationId": "uuid", "dosage": "string", "frequencyPerDay": 1, "timesOfDay": ["HH:mm"], "durationDays": 7, "route": "string?", "instructions": "string?" } ] }
     ```
   - Response: Updated prescription.

10) DELETE /doctor/prescriptions/:id (DOCTOR)
    - Sets status to `CANCELLED`.
    - Response: Updated prescription header.

Monitoring
11) GET /doctor/patients/:id/adherence (DOCTOR)
    - Response:
      ```json
      { "totalItems": 0, "takenLogs": 0, "adherenceRate": 0.0 }
      ```

12) GET /doctor/alerts (DOCTOR)
    - Response: List of alerts for this doctor.

13) PUT /doctor/alerts/:id/resolve (DOCTOR)
    - Response: Updated alert (`resolved: true`).

14) GET /doctor/overview (DOCTOR)
    - Response:
      ```json
      { "patientsCount": 0, "activePrescriptions": 0, "unresolvedAlerts": 0, "adherenceRate": 0.0 }
      ```

### Patient

- Purpose: Patient views, reminders, adherence logging, and alerts.

1) GET /patient/prescriptions (PATIENT)
   - Response: Active prescriptions list.

2) GET /patient/prescriptions/:id (PATIENT)
   - Response: Prescription details with items.

3) GET /patient/history (PATIENT)
   - Query: `page`, `limit`, `sortBy`, `sortOrder=asc|desc`
   - Response:
     ```json
     { "items": [/* prescriptions */], "total": 0, "page": 1, "limit": 20 }
     ```

4) GET /patient/reminders (PATIENT)
   - Response: Expanded schedule computed from `timesOfDay` × `durationDays`.

5) POST /patient/prescriptions/:id/confirm (PATIENT)
   - Body:
     ```json
     { "prescriptionItemId": "uuid", "takenAt": "ISO", "status": "TAKEN|MISSED|SKIPPED", "notes": "string?" }
     ```
   - Response: Created adherence log.

6) GET /patient/adherence (PATIENT)
   - Response: Adherence logs ordered by time.

7) GET /patient/alerts (PATIENT)
   - Response: Alerts for the patient.

8) GET /patient/overview (PATIENT)
   - Response:
     ```json
     { "activePrescriptions": 0, "adherenceRate": 0.0, "unresolvedAlerts": 0 }
     ```

### Notifications

- Purpose: Luồng thông báo/cảnh báo cho bác sĩ và bệnh nhân (dựa trên bảng `Alert`).

1) GET /notifications/doctor (DOCTOR)
   - Query: `page`, `limit`
   - Response:
     ```json
     { "items": [/* alerts */], "total": 0, "page": 1, "limit": 20 }
     ```

2) GET /notifications/patient (PATIENT)
   - Query: `page`, `limit`
   - Response same format như trên.

3) PUT /notifications/:id/resolve (DOCTOR|PATIENT)
   - Đánh dấu alert đã xử lý (`resolved: true`).
   - Response: Alert đã cập nhật.

Alert details & rule (đề xuất):
- Có thể coi “cảnh báo bỏ thuốc nhiều lần” khi trong 7 ngày gần nhất, số log `MISSED` > 3. Ngưỡng (threshold) có thể tinh chỉnh bằng config.
- Nếu muốn lưu lý do cụ thể, có thể thêm field `reason` vào model `Alert`.

### Advanced Reports (optional)

- Admin nâng cao:
  - GET /admin/reports/doctor-adherence?doctorId=... → Tỉ lệ tuân thủ theo bác sĩ
  - GET /admin/reports/patient-adherence?patientId=... → Tỉ lệ tuân thủ theo bệnh nhân
- Chưa triển khai trong code, sẵn sàng bổ sung khi xác nhận yêu cầu.

### Error Format

- Errors follow NestJS HTTP exceptions; typical shape:
  ```json
  { "statusCode": 400, "message": "Error message", "error": "Bad Request" }
  ```

### Auth Notes

- Supply JWT via `Authorization: Bearer <token>` for protected routes.
- Roles: `ADMIN`, `DOCTOR`, `PATIENT`. Access control is enforced in controllers.


