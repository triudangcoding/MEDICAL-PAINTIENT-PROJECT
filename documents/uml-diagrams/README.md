# UML Diagrams Documentation

## Tổng Quan

Thư mục này chứa các sơ đồ UML chi tiết cho hệ thống quản lý y tế. Các sơ đồ UML giúp hiểu rõ cấu trúc, quy trình, và tương tác trong hệ thống.

## Danh Sách Sơ Đồ UML

### 0. 📋 Use Case Diagram
**File**: `00-Use-Case-Diagram.md`
**Mô tả**: Sơ đồ Use Case UML mô tả tổng quan tất cả các chức năng (use cases) và các tác nhân (actors) trong hệ thống.

**Nội dung chính**:
- Actors: Admin, Doctor, Patient, System
- Admin Use Cases: Quản lý người dùng, Quản lý chuyên khoa, Quản lý thuốc, Xem báo cáo, Quản lý đơn thuốc
- Doctor Use Cases: Quản lý bệnh nhân, Kê đơn thuốc, Chỉnh sửa đơn thuốc, Giám sát tuân thủ, Xem lịch sử điều trị
- Patient Use Cases: Xem đơn thuốc, Xem lịch nhắc, Xác nhận uống thuốc, Đánh dấu bỏ lỡ, Xem lịch sử, Quản lý hồ sơ
- System Use Cases: Gửi nhắc nhở, Tạo cảnh báo tuân thủ, Xử lý WebSocket
- Mối quan hệ Include và Extend giữa các use cases

### 1. 📊 Class Diagram
**File**: `01-Class-Diagram.md`
**Mô tả**: Sơ đồ lớp UML mô tả cấu trúc các lớp, thuộc tính, phương thức và mối quan hệ giữa chúng.

**Nội dung chính**:
- Core Entities: User, Prescription, PrescriptionItem, AdherenceLog, Alert
- Services: AuthService, PrescriptionService, NotificationService, ReportService
- Controllers: AuthController, PrescriptionController, DoctorPrescriptionController
- Enumerations: UserRole, PrescriptionStatus, AdherenceStatus, AlertType
- Relationships: One-to-Many, Many-to-One, Many-to-Many

### 2. 🔄 Sequence Diagrams
**File**: `02-Sequence-Diagrams.md`
**Mô tả**: Sơ đồ tuần tự UML mô tả luồng tương tác giữa các đối tượng trong các use case quan trọng.

**Nội dung chính**:
- Kê Đơn Thuốc Điện Tử
- Xác Nhận Uống Thuốc
- Gửi Nhắc Nhở Uống Thuốc
- Tạo Cảnh Báo Tuân Thủ Thấp
- WebSocket Connection Management
- Authentication Flow
- Admin Quản Lý Người Dùng
- Bác Sĩ Chỉnh Sửa Đơn Thuốc
- Bệnh Nhân Đánh Dấu Bỏ Lỡ Thuốc

### 3. 🎯 Activity Diagrams
**File**: `03-Activity-Diagrams.md`
**Mô tả**: Sơ đồ hoạt động UML mô tả các quy trình nghiệp vụ và luồng công việc.

**Nội dung chính**:
- Quy Trình Kê Đơn Thuốc
- Quy Trình Uống Thuốc của Bệnh Nhân
- Quy Trình Giám Sát Tuân Thủ
- Quy Trình Tạo Cảnh Báo Tự Động
- Quy Trình Xử Lý WebSocket Connection
- Quy Trình Authentication

### 4. 🔄 State Machine Diagrams
**File**: `04-State-Machine-Diagrams.md`
**Mô tả**: Sơ đồ trạng thái UML mô tả các trạng thái và chuyển đổi trạng thái của các đối tượng.

**Nội dung chính**:
- Prescription States: CREATED → ACTIVE → COMPLETED/CANCELLED
- User States: INACTIVE → ACTIVE → BLOCKED
- AdherenceLog States: PENDING → TAKEN/MISSED/SKIPPED
- Alert States: CREATED → SENT → READ → RESOLVED
- Medication States: ACTIVE → INACTIVE → ARCHIVED
- MajorDoctor States: ACTIVE → INACTIVE → ARCHIVED
- WebSocket Connection States: CONNECTING → AUTHENTICATING → CONNECTED

### 5. 🏗️ Component Diagrams
**File**: `05-Component-Diagrams.md`
**Mô tả**: Sơ đồ thành phần UML mô tả cấu trúc các thành phần và mối quan hệ giữa chúng.

**Nội dung chính**:
- System Architecture: Frontend, API Gateway, Application, Data Access, Database layers
- Prescription Module: Controllers, Services, Business Logic, Data Models
- Notification Module: Controllers, Services, External Providers, Infrastructure
- Authentication Module: Controllers, Services, Security, External Dependencies
- Database Layer: ORM Layer, Repository Layer, Database Services, Data Models

### 6. 🏛️ System Overview Diagram
**File**: `06-System-Overview.md`
**Mô tả**: Sơ đồ tổng quan hệ thống mô tả kiến trúc tổng thể, các module chính, luồng dữ liệu và mối quan hệ giữa các thành phần.

**Nội dung chính**:
- Kiến Trúc Tổng Thể: Frontend, API Gateway, Backend Services, Data Layer, External Services, Background Jobs
- Luồng Dữ Liệu Chính: Kê đơn thuốc, Uống thuốc, Nhắc nhở tự động, Cảnh báo tuân thủ
- Mô Hình Dữ Liệu Tổng Quan: ERD relationships
- Phân Quyền và Bảo Mật: Authentication, Authorization, RBAC, Security Layers
- Real-time Communication: WebSocket, Notification Types, Delivery Channels
- Background Processing: Cron Jobs, Schedulers, Tasks, Services

## Cách Sử Dụng

### 1. Đọc Sơ Đồ
- Bắt đầu với **Use Case Diagram** để hiểu tổng quan các chức năng và actors
- Xem **System Overview Diagram** để hiểu kiến trúc tổng thể hệ thống
- Đọc **Class Diagram** để hiểu cấu trúc các lớp và mối quan hệ
- Đọc **Sequence Diagrams** để hiểu luồng tương tác giữa các đối tượng
- Xem **Activity Diagrams** để hiểu quy trình nghiệp vụ
- Tham khảo **State Machine Diagrams** để hiểu trạng thái và chuyển đổi
- Đọc **Component Diagrams** để hiểu chi tiết các thành phần

### 2. Sử Dụng Cho Phát Triển
- **Phân tích yêu cầu**: Sử dụng Use Case Diagram để phân tích và định nghĩa chức năng
- **Thiết kế kiến trúc**: Sử dụng System Overview Diagram để thiết kế kiến trúc tổng thể
- **Thiết kế database**: Sử dụng Class Diagram để thiết kế database schema
- **Implement**: Sử dụng Sequence Diagrams để implement API endpoints
- **Testing**: Sử dụng Activity Diagrams để thiết kế test cases
- **Debug**: Sử dụng State Machine Diagrams để debug trạng thái
- **Architecture details**: Sử dụng Component Diagrams để thiết kế chi tiết các thành phần

### 3. Sử Dụng Cho Tài Liệu
- **Onboarding**: Sử dụng để onboard team members mới
- **Training**: Sử dụng để training team về hệ thống
- **Documentation**: Sử dụng để tài liệu hóa hệ thống
- **Communication**: Sử dụng để giao tiếp giữa team

## Công Cụ Tạo Sơ Đồ

### 1. Mermaid
- **Sử dụng**: Tất cả sơ đồ trong tài liệu này được tạo bằng Mermaid
- **Lợi ích**: Dễ đọc, dễ chỉnh sửa, có thể render trực tiếp
- **Syntax**: Sử dụng Mermaid syntax cho các loại sơ đồ khác nhau

### 2. Các Công Cụ Khác
- **Draw.io**: Có thể sử dụng để tạo sơ đồ phức tạp hơn
- **Lucidchart**: Công cụ chuyên nghiệp cho UML diagrams
- **PlantUML**: Công cụ text-based cho UML diagrams
- **Visio**: Microsoft Visio cho enterprise diagrams

## Lưu Ý

### 1. Cập Nhật Sơ Đồ
- Sơ đồ cần được cập nhật khi có thay đổi trong hệ thống
- Đảm bảo tính nhất quán giữa các sơ đồ
- Sử dụng version control để theo dõi thay đổi

### 2. Chất Lượng Sơ Đồ
- Sơ đồ phải rõ ràng và dễ hiểu
- Sử dụng naming convention nhất quán
- Thêm notes và mô tả khi cần thiết

### 3. Bảo Mật
- Không bao gồm thông tin nhạy cảm trong sơ đồ
- Sử dụng placeholder cho sensitive data
- Đảm bảo sơ đồ không expose internal architecture

## Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ về UML diagrams, vui lòng liên hệ với team phát triển.

## Tài Liệu Liên Quan

- [Use Cases Documentation](../use-cases/README.md)
- [System Architecture Documentation](../USE_CASES_AND_ERD.md)
- [API Documentation](../../medical_management_be/docs/api.md)
- [Database Schema](../../medical_management_be/prisma/schema.prisma)
