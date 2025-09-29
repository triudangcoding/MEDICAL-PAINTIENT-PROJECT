# Ghi Chú API Doctor Controller

## Tổng Quan
File `doctor.controller.ts` cung cấp các API endpoints cho chức năng quản lý bác sĩ trong hệ thống quản lý y tế. Controller này được sử dụng rộng rãi trong frontend để thực hiện các thao tác liên quan đến bác sĩ và bệnh nhân.

## Chi Tiết Các API Endpoints

### 1. Quản Lý Danh Sách Bác Sĩ

#### `GET /doctor/doctor`
- **Mục đích**: Lấy danh sách tất cả bác sĩ trong hệ thống
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Tham số**: 
  - `q`: Tìm kiếm theo từ khóa
  - `page`, `limit`: Phân trang
  - `sortBy`, `sortOrder`: Sắp xếp
- **Sử dụng trong Frontend**: 
  - `DoctorManagement.tsx`: Hiển thị danh sách bác sĩ cho admin
  - `doctorApi.getDoctorList()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

### 2. Quản Lý Bệnh Nhân

#### `GET /doctor/patients`
- **Mục đích**: Lấy danh sách bệnh nhân của bác sĩ hiện tại
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Tham số**: Tương tự như danh sách bác sĩ
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Hiển thị danh sách bệnh nhân
  - `DoctorApi.listPatients()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `GET /doctor/patients/:id`
- **Mục đích**: Lấy thông tin chi tiết của một bệnh nhân cụ thể
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Hiển thị thông tin chi tiết bệnh nhân
  - `DoctorApi.getPatient()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `POST /doctor/patients`
- **Mục đích**: Tạo bệnh nhân mới
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Body**: 
  ```typescript
  {
    fullName: string;
    phoneNumber: string;
    password: string;
    profile?: { gender?: string; birthDate?: string; address?: string };
  }
  ```
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Tạo bệnh nhân mới
  - `DoctorApi.createPatient()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `PUT /doctor/patients/:id/profile`
- **Mục đích**: Cập nhật thông tin profile của bệnh nhân
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Body**: `{ gender?: string; birthDate?: string; address?: string }`
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Cập nhật thông tin cơ bản
  - `DoctorApi.updatePatientProfile()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `PUT /doctor/patients/:id/history`
- **Mục đích**: Cập nhật lịch sử y tế của bệnh nhân
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Body**: 
  ```typescript
  {
    conditions?: string[];
    allergies?: string[];
    surgeries?: string[];
    familyHistory?: string;
    lifestyle?: string;
    currentMedications?: string[];
    notes?: string;
    extras?: Record<string, any>;
  }
  ```
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Cập nhật lịch sử y tế
  - `DoctorApi.updatePatientHistory()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

### 3. Quản Lý Đơn Thuốc (Prescriptions)

**Lưu ý**: Các API đơn thuốc đã được di chuyển sang `DoctorPrescriptionsController` nhưng vẫn được gọi từ frontend thông qua các endpoint sau:

#### `GET /doctor/prescriptions`
- **Mục đích**: Lấy danh sách đơn thuốc của bác sĩ
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Hiển thị danh sách đơn thuốc của bệnh nhân
  - `DoctorManagement.tsx`: Quản lý đơn thuốc
  - `DoctorApi.listPrescriptions()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `POST /doctor/prescriptions`
- **Mục đích**: Tạo đơn thuốc mới
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Tạo đơn thuốc cho bệnh nhân
  - `DoctorApi.createPrescription()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `GET /doctor/prescriptions/:id`
- **Mục đích**: Lấy thông tin chi tiết đơn thuốc
- **Sử dụng trong Frontend**:
  - `DoctorPatientsPage.tsx`: Xem chi tiết đơn thuốc
  - `DoctorApi.getPrescription()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `PUT /doctor/prescriptions/:id`
- **Mục đích**: Cập nhật đơn thuốc
- **Sử dụng trong Frontend**:
  - `DoctorApi.updatePrescription()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `DELETE /doctor/prescriptions/:id`
- **Mục đích**: Hủy đơn thuốc
- **Sử dụng trong Frontend**:
  - `DoctorApi.cancelPrescription()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

### 4. Theo Dõi Điều Trị

#### `GET /doctor/overview`
- **Mục đích**: Lấy thống kê tổng quan của bác sĩ
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Hiển thị dashboard tổng quan
  - `DoctorApi.overview()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `GET /doctor/patients/:id/adherence`
- **Mục đích**: Lấy thống kê tuân thủ điều trị của bệnh nhân
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorApi.adherence()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

### 5. Quản Lý Cảnh Báo

#### `GET /doctor/alerts`
- **Mục đích**: Lấy danh sách cảnh báo của bác sĩ
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Hiển thị danh sách cảnh báo
  - `DoctorApi.listAlerts()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `PUT /doctor/alerts/:id/resolve`
- **Mục đích**: Giải quyết cảnh báo
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorApi.resolveAlert()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

### 6. CRUD Operations cho Quản Lý Bác Sĩ

#### `POST /doctor/doctor`
- **Mục đích**: Tạo bác sĩ mới (chỉ dành cho ADMIN)
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Body**: 
  ```typescript
  {
    fullName: string;
    phoneNumber: string;
    password: string;
    majorDoctor: string;
  }
  ```
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Tạo bác sĩ mới
  - `doctorApi.createDoctor()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `PUT /doctor/doctor/:id`
- **Mục đích**: Cập nhật thông tin bác sĩ
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Body**: 
  ```typescript
  {
    fullName?: string;
    phoneNumber?: string;
    majorDoctor?: string;
    status?: string;
  }
  ```
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Cập nhật thông tin bác sĩ
  - `doctorApi.updateDoctor()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `DELETE /doctor/doctor/:id`
- **Mục đích**: Xóa bác sĩ
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `DoctorManagement.tsx`: Xóa bác sĩ
  - `doctorApi.deleteDoctor()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

#### `GET /doctor/doctor/:id`
- **Mục đích**: Lấy thông tin chi tiết bác sĩ
- **Quyền truy cập**: Chỉ DOCTOR và ADMIN
- **Sử dụng trong Frontend**:
  - `doctorApi.getDoctor()`: Gọi API từ frontend
- **Trạng thái**: ✅ Đang được sử dụng tích cực

## Bảo Mật và Quyền Truy Cập

Tất cả các endpoints đều có kiểm tra quyền truy cập thông qua method `ensureDoctor()`:
- Chỉ cho phép user có role `DOCTOR` hoặc `ADMIN`
- Trả về lỗi 403 Forbidden nếu không có quyền

## Frontend Integration

### Các file frontend chính sử dụng:
1. **DoctorManagement.tsx**: Quản lý tổng quan, danh sách bác sĩ, bệnh nhân, đơn thuốc
2. **DoctorPatientsPage.tsx**: Quản lý bệnh nhân chi tiết, tạo đơn thuốc
3. **doctor/api/index.ts**: API client chính cho các endpoint bác sĩ
4. **doctor/api/doctor.api.ts**: API client cho quản lý bác sĩ

### Pattern sử dụng:
- Sử dụng React Query để cache và quản lý state
- Axios instance để gọi API
- Toast notifications cho feedback
- Form validation với Zod schema

## Lưu Ý Quan Trọng

1. **Prescription endpoints**: Mặc dù được comment là "moved to DoctorPrescriptionsController" nhưng frontend vẫn gọi các endpoint này
2. **Authentication**: Tất cả requests đều cần JWT token
3. **Error handling**: Frontend có xử lý lỗi chi tiết với toast notifications
4. **Pagination**: Hầu hết danh sách đều hỗ trợ phân trang và tìm kiếm
5. **Real-time updates**: Sử dụng React Query để invalidate cache khi có thay đổi

## Trạng Thái Sử Dụng

Tất cả các API endpoints trong controller này đều đang được sử dụng tích cực trong frontend, cho thấy controller này là một phần quan trọng của hệ thống quản lý y tế.
