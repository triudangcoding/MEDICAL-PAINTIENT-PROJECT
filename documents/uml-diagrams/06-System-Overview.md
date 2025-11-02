# System Overview Diagram - Medical Management System

## Tổng Quan

Sơ đồ tổng quan hệ thống mô tả kiến trúc tổng thể, các module chính, luồng dữ liệu và mối quan hệ giữa các thành phần trong hệ thống quản lý y tế.

## System Overview - Kiến Trúc Tổng Thể

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend Application]
        UI[UI Components]
        ROUTER[React Router]
        STATE[State Management]
        API_CLIENT[API Client]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway]
        AUTH_MW[Authentication Middleware]
        RATE_LIMIT[Rate Limiting]
        CORS[CORS Handler]
    end
    
    subgraph "Backend Services - NestJS"
        subgraph "Auth Module"
            AUTH_CTRL[Auth Controller]
            AUTH_SVC[Auth Service]
            JWT_SVC[JWT Service]
        end
        
        subgraph "User Module"
            USER_CTRL[User Controller]
            USER_SVC[User Service]
        end
        
        subgraph "Prescription Module"
            PRESC_CTRL[Prescription Controller]
            PRESC_SVC[Prescription Service]
            ADHERENCE_SVC[Adherence Service]
        end
        
        subgraph "Doctor Module"
            DOCTOR_CTRL[Doctor Controller]
            DOCTOR_SVC[Doctor Service]
        end
        
        subgraph "Patient Module"
            PATIENT_CTRL[Patient Controller]
            PATIENT_SVC[Patient Service]
        end
        
        subgraph "Notification Module"
            NOTIF_CTRL[Notification Controller]
            NOTIF_SVC[Notification Service]
            WS_GATEWAY[WebSocket Gateway]
        end
        
        subgraph "Report Module"
            REPORT_CTRL[Report Controller]
            REPORT_SVC[Report Service]
        end
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        POSTGRES[(PostgreSQL Database)]
        REDIS[(Redis Cache)]
    end
    
    subgraph "External Services"
        EMAIL_SVC[Email Service]
        SMS_SVC[SMS Service]
        PUSH_SVC[Push Notification Service]
    end
    
    subgraph "Background Jobs"
        CRON[Cron Jobs]
        MED_SCHEDULER[Medication Scheduler]
        ADH_SCHEDULER[Adherence Checker]
    end
    
    %% Frontend connections
    FE --> UI
    FE --> ROUTER
    FE --> STATE
    FE --> API_CLIENT
    API_CLIENT --> GATEWAY
    
    %% API Gateway connections
    GATEWAY --> AUTH_MW
    GATEWAY --> RATE_LIMIT
    GATEWAY --> CORS
    GATEWAY --> AUTH_CTRL
    GATEWAY --> USER_CTRL
    GATEWAY --> PRESC_CTRL
    GATEWAY --> DOCTOR_CTRL
    GATEWAY --> PATIENT_CTRL
    GATEWAY --> NOTIF_CTRL
    GATEWAY --> REPORT_CTRL
    
    %% Controller to Service connections
    AUTH_CTRL --> AUTH_SVC
    USER_CTRL --> USER_SVC
    PRESC_CTRL --> PRESC_SVC
    PRESC_CTRL --> ADHERENCE_SVC
    DOCTOR_CTRL --> DOCTOR_SVC
    DOCTOR_CTRL --> PRESC_SVC
    PATIENT_CTRL --> PATIENT_SVC
    PATIENT_CTRL --> PRESC_SVC
    NOTIF_CTRL --> NOTIF_SVC
    REPORT_CTRL --> REPORT_SVC
    
    %% Service to Data Layer
    AUTH_SVC --> PRISMA
    USER_SVC --> PRISMA
    PRESC_SVC --> PRISMA
    DOCTOR_SVC --> PRISMA
    PATIENT_SVC --> PRISMA
    NOTIF_SVC --> PRISMA
    REPORT_SVC --> PRISMA
    
    PRISMA --> POSTGRES
    AUTH_SVC --> REDIS
    
    %% Notification connections
    NOTIF_SVC --> WS_GATEWAY
    NOTIF_SVC --> EMAIL_SVC
    NOTIF_SVC --> SMS_SVC
    NOTIF_SVC --> PUSH_SVC
    
    %% Background Jobs connections
    CRON --> MED_SCHEDULER
    CRON --> ADH_SCHEDULER
    MED_SCHEDULER --> NOTIF_SVC
    ADH_SCHEDULER --> NOTIF_SVC
    ADH_SCHEDULER --> REPORT_SVC
    
    %% Cross-module connections
    PRESC_SVC --> NOTIF_SVC
    ADHERENCE_SVC --> NOTIF_SVC
    ADHERENCE_SVC --> REPORT_SVC
    
    style FE fill:#61dafb
    style GATEWAY fill:#ff6b6b
    style POSTGRES fill:#336791
    style REDIS fill:#dc382d
    style WS_GATEWAY fill:#010101
    style CRON fill:#ffd93d
```

## System Overview - Luồng Dữ Liệu Chính

### 1. Luồng Kê Đơn Thuốc

```mermaid
flowchart LR
    A[Doctor] -->|1. Tạo đơn thuốc| B[Doctor Controller]
    B -->|2. Validate| C[Prescription Service]
    C -->|3. Lưu đơn thuốc| D[Database]
    C -->|4. Tạo PrescriptionItems| D
    C -->|5. Gửi thông báo| E[Notification Service]
    E -->|6. WebSocket| F[Patient]
    E -->|7. Alert| D
    D -->|8. Response| C
    C -->|9. Response| B
    B -->|10. Response| A
    
    style A fill:#4ecdc4
    style F fill:#95e1d3
    style D fill:#336791
    style E fill:#ff6b6b
```

### 2. Luồng Uống Thuốc

```mermaid
flowchart LR
    A[Patient] -->|1. Xác nhận uống thuốc| B[Patient Controller]
    B -->|2. Validate| C[Prescription Service]
    C -->|3. Tạo AdherenceLog| D[Database]
    C -->|4. Tính tỷ lệ tuân thủ| D
    C -->|5. Gửi thông báo| E[Notification Service]
    E -->|6. WebSocket| F[Doctor]
    E -->|7. Alert| D
    C -->|8. Response| B
    B -->|9. Response| A
    
    style A fill:#95e1d3
    style F fill:#4ecdc4
    style D fill:#336791
    style E fill:#ff6b6b
```

### 3. Luồng Nhắc Nhở Tự Động

```mermaid
flowchart LR
    A[Cron Job] -->|1. Chạy mỗi phút| B[Medication Scheduler]
    B -->|2. Tìm thuốc sắp uống| C[Database]
    C -->|3. Danh sách thuốc| B
    B -->|4. Tạo reminder| D[Notification Service]
    D -->|5. WebSocket| E[Patient]
    D -->|6. Push Notification| E
    D -->|7. Email| E
    D -->|8. Alert| C
    
    style A fill:#ffd93d
    style E fill:#95e1d3
    style C fill:#336791
    style D fill:#ff6b6b
```

### 4. Luồng Cảnh Báo Tuân Thủ

```mermaid
flowchart LR
    A[Cron Job] -->|1. Chạy hàng ngày| B[Adherence Checker]
    B -->|2. Lấy bệnh nhân| C[Database]
    C -->|3. Danh sách bệnh nhân| B
    B -->|4. Tính tỷ lệ tuân thủ| C
    C -->|5. AdherenceLogs| B
    B -->|6. Tạo cảnh báo nếu < 70%| D[Notification Service]
    D -->|7. WebSocket| E[Doctor]
    D -->|8. Email Alert| E
    D -->|9. Alert| C
    
    style A fill:#ffd93d
    style E fill:#4ecdc4
    style C fill:#336791
    style D fill:#ff6b6b
```

## System Overview - Mô Hình Dữ Liệu Tổng Quan

```mermaid
erDiagram
    USER ||--o{ PATIENT_PROFILE : has
    USER ||--o{ PRESCRIPTION : creates_as_doctor
    USER ||--o{ PRESCRIPTION : receives_as_patient
    USER ||--o{ ADHERENCE_LOG : creates
    USER ||--o{ ALERT : receives
    USER }o--|| MAJOR_DOCTOR_TABLE : belongs_to
    
    PRESCRIPTION ||--o{ PRESCRIPTION_ITEM : contains
    PRESCRIPTION ||--o{ ADHERENCE_LOG : has
    PRESCRIPTION ||--o{ ALERT : generates
    
    PRESCRIPTION_ITEM }o--|| MEDICATION : uses
    PRESCRIPTION_ITEM ||--o{ ADHERENCE_LOG : tracks
    
    PATIENT_PROFILE ||--o| PATIENT_MEDICAL_HISTORY : has
```

## System Overview - Phân Quyền và Bảo Mật

```mermaid
graph TB
    subgraph "Authentication & Authorization"
        AUTH[Authentication Service]
        JWT[JWT Service]
        RBAC[Role-Based Access Control]
    end
    
    subgraph "User Roles"
        ADMIN[Admin Role]
        DOCTOR[Doctor Role]
        PATIENT[Patient Role]
    end
    
    subgraph "Security Layers"
        HTTPS[HTTPS Encryption]
        PWD_HASH[Password Hashing - BCrypt]
        TOKEN[Token Management]
        RATE_LIMIT[Rate Limiting]
    end
    
    subgraph "Protected Resources"
        ADMIN_RES[Admin Resources]
        DOCTOR_RES[Doctor Resources]
        PATIENT_RES[Patient Resources]
    end
    
    HTTPS --> AUTH
    AUTH --> JWT
    JWT --> RBAC
    RBAC --> ADMIN
    RBAC --> DOCTOR
    RBAC --> PATIENT
    
    ADMIN --> ADMIN_RES
    DOCTOR --> DOCTOR_RES
    PATIENT --> PATIENT_RES
    
    AUTH --> PWD_HASH
    AUTH --> TOKEN
    AUTH --> RATE_LIMIT
    
    style AUTH fill:#ff6b6b
    style JWT fill:#4ecdc4
    style RBAC fill:#95e1d3
    style HTTPS fill:#ffe66d
```

## System Overview - Real-time Communication

```mermaid
graph TB
    subgraph "Client Side"
        FE[React Frontend]
        WS_CLIENT[WebSocket Client]
    end
    
    subgraph "Server Side"
        WS_GATEWAY[WebSocket Gateway]
        WS_SERVICE[WebSocket Service]
        ROOM_MGR[Room Manager]
    end
    
    subgraph "Notification Types"
        REMINDER[Medication Reminders]
        ALERT[Adherence Alerts]
        UPDATE[Prescription Updates]
        SYSTEM[System Notifications]
    end
    
    subgraph "Delivery Channels"
        WS[WebSocket]
        EMAIL[Email]
        PUSH[Push Notification]
        SMS[SMS]
    end
    
    FE --> WS_CLIENT
    WS_CLIENT <--> WS_GATEWAY
    WS_GATEWAY --> WS_SERVICE
    WS_SERVICE --> ROOM_MGR
    
    REMINDER --> WS_SERVICE
    ALERT --> WS_SERVICE
    UPDATE --> WS_SERVICE
    SYSTEM --> WS_SERVICE
    
    WS_SERVICE --> WS
    WS_SERVICE --> EMAIL
    WS_SERVICE --> PUSH
    WS_SERVICE --> SMS
    
    style WS_GATEWAY fill:#010101
    style WS_SERVICE fill:#ff6b6b
    style REMINDER fill:#ffe66d
    style ALERT fill:#ff9999
```

## System Overview - Background Processing

```mermaid
graph TB
    subgraph "Cron Jobs"
        CRON_1[Every Minute<br/>Medication Reminder]
        CRON_2[Daily 9:00 AM<br/>Adherence Check]
        CRON_3[Daily 12:00 AM<br/>Data Cleanup]
    end
    
    subgraph "Schedulers"
        MED_SCHED[Medication Scheduler]
        ADH_SCHED[Adherence Scheduler]
        CLEANUP_SCHED[Cleanup Scheduler]
    end
    
    subgraph "Tasks"
        TASK_1[Send Reminders]
        TASK_2[Check Adherence]
        TASK_3[Generate Reports]
        TASK_4[Cleanup Old Data]
    end
    
    subgraph "Services"
        NOTIF_SVC[Notification Service]
        REPORT_SVC[Report Service]
        DB_SVC[Database Service]
    end
    
    CRON_1 --> MED_SCHED
    CRON_2 --> ADH_SCHED
    CRON_3 --> CLEANUP_SCHED
    
    MED_SCHED --> TASK_1
    ADH_SCHED --> TASK_2
    ADH_SCHED --> TASK_3
    CLEANUP_SCHED --> TASK_4
    
    TASK_1 --> NOTIF_SVC
    TASK_2 --> NOTIF_SVC
    TASK_2 --> REPORT_SVC
    TASK_3 --> REPORT_SVC
    TASK_4 --> DB_SVC
    
    style CRON_1 fill:#ffd93d
    style CRON_2 fill:#ffd93d
    style CRON_3 fill:#ffd93d
    style NOTIF_SVC fill:#ff6b6b
    style REPORT_SVC fill:#4ecdc4
```

## Tổng Kết

### Các Thành Phần Chính

1. **Frontend Layer**: React application với UI components, routing, state management
2. **API Gateway**: Xử lý authentication, rate limiting, CORS
3. **Backend Services**: NestJS modules cho các chức năng chính
4. **Data Layer**: PostgreSQL database với Prisma ORM và Redis cache
5. **External Services**: Email, SMS, Push notification services
6. **Background Jobs**: Cron jobs cho scheduled tasks

### Luồng Dữ Liệu Chính

1. **Kê Đơn Thuốc**: Doctor → Controller → Service → Database → Notification → Patient
2. **Uống Thuốc**: Patient → Controller → Service → Database → Notification → Doctor
3. **Nhắc Nhở Tự Động**: Cron → Scheduler → Database → Notification → Patient
4. **Cảnh Báo Tuân Thủ**: Cron → Checker → Database → Notification → Doctor

### Tính Năng Nổi Bật

1. **Real-time Communication**: WebSocket cho thông báo tức thời
2. **Automated Scheduling**: Cron jobs cho nhắc nhở và kiểm tra tự động
3. **Role-Based Access Control**: Phân quyền chi tiết theo vai trò
4. **Data Analytics**: Báo cáo và thống kê tuân thủ
5. **Multi-channel Notifications**: WebSocket, Email, SMS, Push

## Lợi Ích Của System Overview Diagram

1. **Hiểu rõ kiến trúc**: Giúp hiểu rõ kiến trúc tổng thể của hệ thống
2. **Thiết kế hệ thống**: Hỗ trợ thiết kế và phát triển hệ thống
3. **Tài liệu hóa**: Tài liệu hóa kiến trúc cho team phát triển
4. **Giao tiếp**: Giúp giao tiếp giữa team về kiến trúc hệ thống
5. **Onboarding**: Hỗ trợ onboard team members mới
6. **Maintenance**: Dễ dàng bảo trì và mở rộng hệ thống

