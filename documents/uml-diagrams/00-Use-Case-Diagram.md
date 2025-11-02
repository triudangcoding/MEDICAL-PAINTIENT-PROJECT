# UML Use Case Diagram - Medical Management System

## Tổng Quan

Sơ đồ Use Case UML mô tả tổng quan tất cả các chức năng (use cases) và các tác nhân (actors) trong hệ thống quản lý y tế. Sơ đồ này giúp hiểu rõ phạm vi hệ thống và mối quan hệ giữa người dùng và chức năng.

## Use Case Diagram - Tổng Quan Hệ Thống

```mermaid
graph TB
    %% Actors - Hình người (Actor stick figure representation)
    ADMIN(( :👤<br/>Admin<br/>Quản trị viên :))
    DOCTOR(( :👨‍⚕️<br/>Doctor<br/>Bác sĩ :))
    PATIENT(( :👤<br/>Patient<br/>Bệnh nhân :))
    SYSTEM(( :⚙️<br/>System<br/>Hệ thống :))
    
    %% System Boundary - Hệ thống quản lý y tế
    subgraph SYS["Medical Management System"]
        %% Admin Use Cases - Hình tròn/oval
        UC_ADMIN_001(("Quản Lý<br/>Người Dùng"))
        UC_ADMIN_002(("Quản Lý<br/>Chuyên Khoa"))
        UC_ADMIN_003(("Quản Lý<br/>Thuốc"))
        UC_ADMIN_004(("Xem Báo Cáo<br/>Tổng Quan"))
        UC_ADMIN_005(("Quản Lý<br/>Đơn Thuốc"))
        
        %% Doctor Use Cases - Hình tròn/oval
        UC_DOCTOR_001(("Quản Lý<br/>Bệnh Nhân"))
        UC_DOCTOR_002(("Kê Đơn Thuốc<br/>Điện Tử"))
        UC_DOCTOR_003(("Chỉnh Sửa<br/>Đơn Thuốc"))
        UC_DOCTOR_004(("Giám Sát Tuân Thủ<br/>Uống Thuốc"))
        UC_DOCTOR_005(("Xem Lịch Sử<br/>Điều Trị"))
        
        %% Patient Use Cases - Hình tròn/oval
        UC_PATIENT_001(("Xem<br/>Đơn Thuốc"))
        UC_PATIENT_002(("Xem Lịch Nhắc<br/>Uống Thuốc"))
        UC_PATIENT_003(("Xác Nhận Đã<br/>Uống Thuốc"))
        UC_PATIENT_004(("Đánh Dấu<br/>Bỏ Lỡ Thuốc"))
        UC_PATIENT_005(("Xem Lịch Sử<br/>Dùng Thuốc"))
        UC_PATIENT_006(("Quản Lý Hồ Sơ<br/>Bệnh Án"))
        
        %% System Use Cases - Hình tròn/oval
        UC_SYSTEM_001(("Gửi Nhắc Nhở<br/>Uống Thuốc"))
        UC_SYSTEM_002(("Tạo Cảnh Báo<br/>Tuân Thủ Thấp"))
        UC_SYSTEM_003(("Xử Lý WebSocket<br/>Connections"))
    end
    
    %% Associations - Nét liền (solid line) giữa Actors và Use Cases
    ADMIN ---|>| UC_ADMIN_001
    ADMIN ---|>| UC_ADMIN_002
    ADMIN ---|>| UC_ADMIN_003
    ADMIN ---|>| UC_ADMIN_004
    ADMIN ---|>| UC_ADMIN_005
    
    DOCTOR ---|>| UC_DOCTOR_001
    DOCTOR ---|>| UC_DOCTOR_002
    DOCTOR ---|>| UC_DOCTOR_003
    DOCTOR ---|>| UC_DOCTOR_004
    DOCTOR ---|>| UC_DOCTOR_005
    
    PATIENT ---|>| UC_PATIENT_001
    PATIENT ---|>| UC_PATIENT_002
    PATIENT ---|>| UC_PATIENT_003
    PATIENT ---|>| UC_PATIENT_004
    PATIENT ---|>| UC_PATIENT_005
    PATIENT ---|>| UC_PATIENT_006
    
    SYSTEM ---|>| UC_SYSTEM_001
    SYSTEM ---|>| UC_SYSTEM_002
    SYSTEM ---|>| UC_SYSTEM_003
    
    %% Dependencies - Nét đứt (dashed line) cho relationships
    UC_DOCTOR_002 -.->|"&lt;&lt;triggers&gt;&gt;"| UC_PATIENT_001
    UC_DOCTOR_004 -.->|"&lt;&lt;monitors&gt;&gt;"| UC_PATIENT_003
    UC_SYSTEM_001 -.->|"&lt;&lt;triggers&gt;&gt;"| UC_PATIENT_003
    UC_SYSTEM_002 -.->|"&lt;&lt;notifies&gt;&gt;"| UC_DOCTOR_004
    
    %% Styling - Actors (hình người) màu xanh
    style ADMIN fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style DOCTOR fill:#50c878,stroke:#2e7d4e,stroke-width:3px,color:#fff
    style PATIENT fill:#ff6b9d,stroke:#c44569,stroke-width:3px,color:#fff
    style SYSTEM fill:#9b59b6,stroke:#6c3483,stroke-width:3px,color:#fff
    
    %% Styling - Use Cases (hình tròn) màu vàng cam
    style UC_ADMIN_001 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC_ADMIN_002 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC_ADMIN_003 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC_ADMIN_004 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC_ADMIN_005 fill:#ffe66d,stroke:#333,stroke-width:2px
    
    style UC_DOCTOR_001 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC_DOCTOR_002 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC_DOCTOR_003 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC_DOCTOR_004 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC_DOCTOR_005 fill:#a8e6cf,stroke:#333,stroke-width:2px
    
    style UC_PATIENT_001 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC_PATIENT_002 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC_PATIENT_003 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC_PATIENT_004 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC_PATIENT_005 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC_PATIENT_006 fill:#d4f1f4,stroke:#333,stroke-width:2px
    
    style UC_SYSTEM_001 fill:#ffd3b6,stroke:#333,stroke-width:2px
    style UC_SYSTEM_002 fill:#ffd3b6,stroke:#333,stroke-width:2px
    style UC_SYSTEM_003 fill:#ffd3b6,stroke:#333,stroke-width:2px
    
    %% System boundary styling
    style SYS fill:#f0f0f0,stroke:#333,stroke-width:3px,stroke-dasharray: 5 5
```

## Use Case Diagram - Phân Rã Chi Tiết (Decomposition)

### 1. Admin - Quản Lý Người Dùng (Phân Rã)

```mermaid
graph TB
    %% Actor
    ADMIN(( :👤<br/>Admin :))
    
    %% Use Case tổng quát
    UC_ADMIN_USER(("Quản Lý<br/>Người Dùng"))
    
    subgraph USER_MGMT["User Management Details"]
        %% Use Cases chi tiết
        UC_CREATE_USER(("Tạo Người<br/>Dùng"))
        UC_VIEW_USERS(("Xem Danh Sách<br/>Người Dùng"))
        UC_VIEW_DETAIL(("Xem Chi Tiết<br/>Người Dùng"))
        UC_UPDATE_USER(("Cập Nhật<br/>Người Dùng"))
        UC_DELETE_USER(("Xóa Người<br/>Dùng"))
        UC_SEARCH_USER(("Tìm Kiếm<br/>Người Dùng"))
        UC_FILTER_USER(("Lọc Người<br/>Dùng"))
        UC_EXPORT_USER(("Xuất Excel<br/>Người Dùng"))
    end
    
    %% Association từ actor đến use case tổng quát
    ADMIN ---|>| UC_ADMIN_USER
    
    %% Generalization/Composition từ use case tổng quát đến các use case chi tiết
    UC_ADMIN_USER ---|includes| UC_CREATE_USER
    UC_ADMIN_USER ---|includes| UC_VIEW_USERS
    UC_ADMIN_USER ---|includes| UC_VIEW_DETAIL
    UC_ADMIN_USER ---|includes| UC_UPDATE_USER
    UC_ADMIN_USER ---|includes| UC_DELETE_USER
    UC_ADMIN_USER ---|includes| UC_SEARCH_USER
    UC_ADMIN_USER ---|includes| UC_FILTER_USER
    UC_ADMIN_USER ---|includes| UC_EXPORT_USER
    
    %% Dependencies
    UC_VIEW_DETAIL -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_USERS
    UC_UPDATE_USER -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_DETAIL
    UC_DELETE_USER -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_DETAIL
    
    %% Styling
    style ADMIN fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style UC_ADMIN_USER fill:#ffe66d,stroke:#333,stroke-width:3px
    style UC_CREATE_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_VIEW_USERS fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_VIEW_DETAIL fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_UPDATE_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_DELETE_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_SEARCH_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_FILTER_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_EXPORT_USER fill:#ffd93d,stroke:#333,stroke-width:2px
    style USER_MGMT fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 2. Admin - Quản Lý Chuyên Khoa (Phân Rã)

```mermaid
graph TB
    ADMIN(( :👤<br/>Admin :))
    
    UC_ADMIN_MAJOR(("Quản Lý<br/>Chuyên Khoa"))
    
    subgraph MAJOR_MGMT["Major Management Details"]
        UC_CREATE_MAJOR(("Tạo Chuyên<br/>Khoa"))
        UC_VIEW_MAJORS(("Xem Danh Sách<br/>Chuyên Khoa"))
        UC_UPDATE_MAJOR(("Cập Nhật<br/>Chuyên Khoa"))
        UC_DELETE_MAJOR(("Xóa Chuyên<br/>Khoa"))
        UC_ACTIVATE_MAJOR(("Kích Hoạt/<br/>Vô Hiệu Hóa"))
        UC_SORT_MAJOR(("Sắp Xếp<br/>Chuyên Khoa"))
    end
    
    ADMIN ---|>| UC_ADMIN_MAJOR
    
    UC_ADMIN_MAJOR ---|includes| UC_CREATE_MAJOR
    UC_ADMIN_MAJOR ---|includes| UC_VIEW_MAJORS
    UC_ADMIN_MAJOR ---|includes| UC_UPDATE_MAJOR
    UC_ADMIN_MAJOR ---|includes| UC_DELETE_MAJOR
    UC_ADMIN_MAJOR ---|includes| UC_ACTIVATE_MAJOR
    UC_ADMIN_MAJOR ---|includes| UC_SORT_MAJOR
    
    UC_UPDATE_MAJOR -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_MAJORS
    UC_ACTIVATE_MAJOR -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_MAJORS
    
    style ADMIN fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style UC_ADMIN_MAJOR fill:#ffe66d,stroke:#333,stroke-width:3px
    style UC_CREATE_MAJOR fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_VIEW_MAJORS fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_UPDATE_MAJOR fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_DELETE_MAJOR fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_ACTIVATE_MAJOR fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_SORT_MAJOR fill:#ffd93d,stroke:#333,stroke-width:2px
    style MAJOR_MGMT fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 3. Admin - Quản Lý Thuốc (Phân Rã)

```mermaid
graph TB
    ADMIN(( :👤<br/>Admin :))
    
    UC_ADMIN_MED(("Quản Lý<br/>Thuốc"))
    
    subgraph MED_MGMT["Medication Management Details"]
        UC_CREATE_MED(("Thêm Thuốc<br/>Mới"))
        UC_VIEW_MEDS(("Xem Danh Sách<br/>Thuốc"))
        UC_UPDATE_MED(("Cập Nhật<br/>Thuốc"))
        UC_DELETE_MED(("Xóa Thuốc"))
        UC_ACTIVATE_MED(("Kích Hoạt/<br/>Vô Hiệu Hóa"))
        UC_SEARCH_MED(("Tìm Kiếm<br/>Thuốc"))
        UC_IMPORT_MED(("Import Danh Sách<br/>Thuốc"))
    end
    
    ADMIN ---|>| UC_ADMIN_MED
    
    UC_ADMIN_MED ---|includes| UC_CREATE_MED
    UC_ADMIN_MED ---|includes| UC_VIEW_MEDS
    UC_ADMIN_MED ---|includes| UC_UPDATE_MED
    UC_ADMIN_MED ---|includes| UC_DELETE_MED
    UC_ADMIN_MED ---|includes| UC_ACTIVATE_MED
    UC_ADMIN_MED ---|includes| UC_SEARCH_MED
    UC_ADMIN_MED ---|includes| UC_IMPORT_MED
    
    UC_UPDATE_MED -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_MEDS
    UC_ACTIVATE_MED -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_MEDS
    
    style ADMIN fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style UC_ADMIN_MED fill:#ffe66d,stroke:#333,stroke-width:3px
    style UC_CREATE_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_VIEW_MEDS fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_UPDATE_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_DELETE_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_ACTIVATE_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_SEARCH_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style UC_IMPORT_MED fill:#ffd93d,stroke:#333,stroke-width:2px
    style MED_MGMT fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 4. Doctor - Kê Đơn Thuốc Điện Tử (Phân Rã)

```mermaid
graph TB
    DOCTOR(( :👨‍⚕️<br/>Doctor :))
    
    UC_DOCTOR_PRESC(("Kê Đơn Thuốc<br/>Điện Tử"))
    
    subgraph PRESC_CREATE["Prescription Creation Details"]
        UC_SELECT_PATIENT(("Chọn Bệnh<br/>Nhân"))
        UC_VIEW_PATIENT_INFO(("Xem Thông Tin<br/>Bệnh Nhân"))
        UC_CHECK_ALLERGY(("Kiểm Tra<br/>Dị Ứng"))
        UC_SELECT_MED(("Chọn Thuốc<br/>Từ Danh Mục"))
        UC_CHECK_INTERACTION(("Kiểm Tra Tương Tác<br/>Thuốc"))
        UC_ENTER_DOSAGE(("Nhập Liều<br/>Lượng"))
        UC_SET_SCHEDULE(("Thiết Lập Lịch<br/>Uống Thuốc"))
        UC_ADD_NOTES(("Thêm Ghi<br/>Chú"))
        UC_REVIEW_PRESC(("Xem Lại<br/>Đơn Thuốc"))
        UC_CONFIRM_PRESC(("Xác Nhận Tạo<br/>Đơn Thuốc"))
    end
    
    DOCTOR ---|>| UC_DOCTOR_PRESC
    
    UC_DOCTOR_PRESC ---|includes| UC_SELECT_PATIENT
    UC_DOCTOR_PRESC ---|includes| UC_VIEW_PATIENT_INFO
    UC_DOCTOR_PRESC ---|includes| UC_SELECT_MED
    UC_DOCTOR_PRESC ---|includes| UC_ENTER_DOSAGE
    UC_DOCTOR_PRESC ---|includes| UC_SET_SCHEDULE
    UC_DOCTOR_PRESC ---|includes| UC_REVIEW_PRESC
    UC_DOCTOR_PRESC ---|includes| UC_CONFIRM_PRESC
    
    UC_CHECK_ALLERGY -.->|"&lt;&lt;extends&gt;&gt;"| UC_SELECT_MED
    UC_CHECK_INTERACTION -.->|"&lt;&lt;extends&gt;&gt;"| UC_SELECT_MED
    UC_ADD_NOTES -.->|"&lt;&lt;extends&gt;&gt;"| UC_REVIEW_PRESC
    
    style DOCTOR fill:#50c878,stroke:#2e7d4e,stroke-width:3px,color:#fff
    style UC_DOCTOR_PRESC fill:#a8e6cf,stroke:#333,stroke-width:3px
    style UC_SELECT_PATIENT fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_VIEW_PATIENT_INFO fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_CHECK_ALLERGY fill:#ff9999,stroke:#333,stroke-width:2px
    style UC_SELECT_MED fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_CHECK_INTERACTION fill:#ff9999,stroke:#333,stroke-width:2px
    style UC_ENTER_DOSAGE fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_SET_SCHEDULE fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_ADD_NOTES fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_REVIEW_PRESC fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_CONFIRM_PRESC fill:#95e1d3,stroke:#333,stroke-width:2px
    style PRESC_CREATE fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 5. Patient - Xác Nhận Đã Uống Thuốc (Phân Rã)

```mermaid
graph TB
    PATIENT(( :👤<br/>Patient :))
    
    UC_PATIENT_CONFIRM(("Xác Nhận Đã<br/>Uống Thuốc"))
    
    subgraph CONFIRM_DETAILS["Confirmation Details"]
        UC_RECEIVE_REMINDER(("Nhận Nhắc Nhở<br/>Uống Thuốc"))
        UC_VIEW_MED_LIST(("Xem Danh Sách<br/>Thuốc Cần Uống"))
        UC_CONFIRM_NORMAL(("Xác Nhận Uống<br/>Đúng Liều"))
        UC_CONFIRM_DIFF_DOSE(("Xác Nhận Uống<br/>Khác Liều"))
        UC_CONFIRM_LATE(("Xác Nhận Uống<br/>Muộn"))
        UC_ADD_NOTES_PATIENT(("Thêm Ghi Chú<br/>Cá Nhân"))
        UC_VIEW_HISTORY(("Xem Lịch Sử<br/>Xác Nhận"))
    end
    
    PATIENT ---|>| UC_PATIENT_CONFIRM
    
    UC_PATIENT_CONFIRM ---|includes| UC_RECEIVE_REMINDER
    UC_PATIENT_CONFIRM ---|includes| UC_VIEW_MED_LIST
    UC_PATIENT_CONFIRM ---|includes| UC_CONFIRM_NORMAL
    
    UC_CONFIRM_DIFF_DOSE -.->|"&lt;&lt;extends&gt;&gt;"| UC_PATIENT_CONFIRM
    UC_CONFIRM_LATE -.->|"&lt;&lt;extends&gt;&gt;"| UC_PATIENT_CONFIRM
    UC_ADD_NOTES_PATIENT -.->|"&lt;&lt;extends&gt;&gt;"| UC_CONFIRM_NORMAL
    UC_VIEW_HISTORY -.->|"&lt;&lt;extends&gt;&gt;"| UC_PATIENT_CONFIRM
    
    style PATIENT fill:#ff6b9d,stroke:#c44569,stroke-width:3px,color:#fff
    style UC_PATIENT_CONFIRM fill:#d4f1f4,stroke:#333,stroke-width:3px
    style UC_RECEIVE_REMINDER fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_VIEW_MED_LIST fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_CONFIRM_NORMAL fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_CONFIRM_DIFF_DOSE fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_CONFIRM_LATE fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_ADD_NOTES_PATIENT fill:#c4e8f4,stroke:#333,stroke-width:2px
    style UC_VIEW_HISTORY fill:#c4e8f4,stroke:#333,stroke-width:2px
    style CONFIRM_DETAILS fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 6. Doctor - Giám Sát Tuân Thủ Uống Thuốc (Phân Rã)

```mermaid
graph TB
    DOCTOR(( :👨‍⚕️<br/>Doctor :))
    
    UC_DOCTOR_MONITOR(("Giám Sát Tuân Thủ<br/>Uống Thuốc"))
    
    subgraph MONITOR_DETAILS["Adherence Monitoring Details"]
        UC_VIEW_ADHERENCE_LIST(("Xem Danh Sách<br/>Tuân Thủ"))
        UC_VIEW_ADHERENCE_RATE(("Xem Tỷ Lệ<br/>Tuân Thủ"))
        UC_VIEW_ADHERENCE_CHART(("Xem Biểu Đồ<br/>Tuân Thủ"))
        UC_VIEW_ADHERENCE_LOG(("Xem Nhật Ký<br/>Uống Thuốc"))
        UC_DETECT_LOW_ADHERENCE(("Phát Hiện Tuân Thủ<br/>Thấp"))
        UC_SEND_REMINDER(("Gửi Nhắc Nhở<br/>Cho Bệnh Nhân"))
        UC_EXPORT_ADHERENCE(("Xuất Báo Cáo<br/>Tuân Thủ"))
    end
    
    DOCTOR ---|>| UC_DOCTOR_MONITOR
    
    UC_DOCTOR_MONITOR ---|includes| UC_VIEW_ADHERENCE_LIST
    UC_DOCTOR_MONITOR ---|includes| UC_VIEW_ADHERENCE_RATE
    UC_DOCTOR_MONITOR ---|includes| UC_VIEW_ADHERENCE_CHART
    UC_DOCTOR_MONITOR ---|includes| UC_VIEW_ADHERENCE_LOG
    
    UC_DETECT_LOW_ADHERENCE -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_ADHERENCE_RATE
    UC_SEND_REMINDER -.->|"&lt;&lt;extends&gt;&gt;"| UC_DETECT_LOW_ADHERENCE
    UC_EXPORT_ADHERENCE -.->|"&lt;&lt;extends&gt;&gt;"| UC_VIEW_ADHERENCE_LIST
    
    style DOCTOR fill:#50c878,stroke:#2e7d4e,stroke-width:3px,color:#fff
    style UC_DOCTOR_MONITOR fill:#a8e6cf,stroke:#333,stroke-width:3px
    style UC_VIEW_ADHERENCE_LIST fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_VIEW_ADHERENCE_RATE fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_VIEW_ADHERENCE_CHART fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_VIEW_ADHERENCE_LOG fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_DETECT_LOW_ADHERENCE fill:#ff9999,stroke:#333,stroke-width:2px
    style UC_SEND_REMINDER fill:#95e1d3,stroke:#333,stroke-width:2px
    style UC_EXPORT_ADHERENCE fill:#95e1d3,stroke:#333,stroke-width:2px
    style MONITOR_DETAILS fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 7. System - Gửi Nhắc Nhở Uống Thuốc (Phân Rã)

```mermaid
graph TB
    SYSTEM(( :⚙️<br/>System :))
    
    UC_SYSTEM_REMINDER(("Gửi Nhắc Nhở<br/>Uống Thuốc"))
    
    subgraph REMINDER_DETAILS["Reminder System Details"]
        UC_SCHEDULE_CHECK(("Kiểm Tra Lịch<br/>Uống Thuốc"))
        UC_FIND_UPCOMING(("Tìm Thuốc Sắp<br/>Uống"))
        UC_CREATE_ALERT(("Tạo Alert<br/>Nhắc Nhở"))
        UC_SEND_WEBSOCKET(("Gửi WebSocket<br/>Notification"))
        UC_SEND_EMAIL(("Gửi Email<br/>Notification"))
        UC_SEND_PUSH(("Gửi Push<br/>Notification"))
        UC_LOG_REMINDER(("Ghi Log<br/>Nhắc Nhở"))
    end
    
    SYSTEM ---|>| UC_SYSTEM_REMINDER
    
    UC_SYSTEM_REMINDER ---|includes| UC_SCHEDULE_CHECK
    UC_SYSTEM_REMINDER ---|includes| UC_FIND_UPCOMING
    UC_SYSTEM_REMINDER ---|includes| UC_CREATE_ALERT
    UC_SYSTEM_REMINDER ---|includes| UC_SEND_WEBSOCKET
    UC_SYSTEM_REMINDER ---|includes| UC_LOG_REMINDER
    
    UC_SEND_EMAIL -.->|"&lt;&lt;extends&gt;&gt;"| UC_CREATE_ALERT
    UC_SEND_PUSH -.->|"&lt;&lt;extends&gt;&gt;"| UC_CREATE_ALERT
    
    style SYSTEM fill:#9b59b6,stroke:#6c3483,stroke-width:3px,color:#fff
    style UC_SYSTEM_REMINDER fill:#ffd3b6,stroke:#333,stroke-width:3px
    style UC_SCHEDULE_CHECK fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_FIND_UPCOMING fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_CREATE_ALERT fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_SEND_WEBSOCKET fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_SEND_EMAIL fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_SEND_PUSH fill:#ffc9a0,stroke:#333,stroke-width:2px
    style UC_LOG_REMINDER fill:#ffc9a0,stroke:#333,stroke-width:2px
    style REMINDER_DETAILS fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## Use Case Diagram - Chi Tiết Theo Module

### 1. Module Quản Trị (Admin Module)

```mermaid
graph LR
    %% Actor - Hình người
    ADMIN(( :👤<br/>Admin :))
    
    subgraph ADMIN_MOD["Admin Module - System Boundary"]
        %% Use Cases - Hình tròn/oval
        UC1(("Quản Lý<br/>Người Dùng"))
        UC2(("Quản Lý<br/>Chuyên Khoa"))
        UC3(("Quản Lý<br/>Thuốc"))
        UC4(("Xem Báo Cáo<br/>Tổng Quan"))
        UC5(("Quản Lý<br/>Đơn Thuốc"))
    end
    
    %% Associations - Nét liền
    ADMIN ---|>| UC1
    ADMIN ---|>| UC2
    ADMIN ---|>| UC3
    ADMIN ---|>| UC4
    ADMIN ---|>| UC5
    
    %% Styling
    style ADMIN fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style UC1 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC2 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC3 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC4 fill:#ffe66d,stroke:#333,stroke-width:2px
    style UC5 fill:#ffe66d,stroke:#333,stroke-width:2px
    style ADMIN_MOD fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 2. Module Bác Sĩ (Doctor Module)

```mermaid
graph LR
    %% Actor - Hình người
    DOCTOR(( :👨‍⚕️<br/>Doctor :))
    
    subgraph DOCTOR_MOD["Doctor Module - System Boundary"]
        %% Use Cases - Hình tròn/oval
        UC1(("Quản Lý<br/>Bệnh Nhân"))
        UC2(("Kê Đơn Thuốc<br/>Điện Tử"))
        UC3(("Chỉnh Sửa<br/>Đơn Thuốc"))
        UC4(("Giám Sát<br/>Tuân Thủ"))
        UC5(("Xem Lịch Sử<br/>Điều Trị"))
    end
    
    %% Associations - Nét liền
    DOCTOR ---|>| UC1
    DOCTOR ---|>| UC2
    DOCTOR ---|>| UC3
    DOCTOR ---|>| UC4
    DOCTOR ---|>| UC5
    
    %% Styling
    style DOCTOR fill:#50c878,stroke:#2e7d4e,stroke-width:3px,color:#fff
    style UC1 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC2 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC3 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC4 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style UC5 fill:#a8e6cf,stroke:#333,stroke-width:2px
    style DOCTOR_MOD fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 3. Module Bệnh Nhân (Patient Module)

```mermaid
graph LR
    %% Actor - Hình người
    PATIENT(( :👤<br/>Patient :))
    
    subgraph PATIENT_MOD["Patient Module - System Boundary"]
        %% Use Cases - Hình tròn/oval
        UC1(("Xem<br/>Đơn Thuốc"))
        UC2(("Xem Lịch Nhắc<br/>Uống Thuốc"))
        UC3(("Xác Nhận<br/>Đã Uống Thuốc"))
        UC4(("Đánh Dấu<br/>Bỏ Lỡ Thuốc"))
        UC5(("Xem Lịch Sử<br/>Dùng Thuốc"))
        UC6(("Quản Lý<br/>Hồ Sơ Bệnh Án"))
    end
    
    %% Associations - Nét liền
    PATIENT ---|>| UC1
    PATIENT ---|>| UC2
    PATIENT ---|>| UC3
    PATIENT ---|>| UC4
    PATIENT ---|>| UC5
    PATIENT ---|>| UC6
    
    %% Styling
    style PATIENT fill:#ff6b9d,stroke:#c44569,stroke-width:3px,color:#fff
    style UC1 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC2 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC3 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC4 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC5 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style UC6 fill:#d4f1f4,stroke:#333,stroke-width:2px
    style PATIENT_MOD fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

### 4. Module Hệ Thống (System Module)

```mermaid
graph LR
    %% Actor - Hình người (System được thể hiện như actor)
    SYSTEM(( :⚙️<br/>System :))
    
    subgraph SYSTEM_MOD["System Module - System Boundary"]
        %% Use Cases - Hình tròn/oval
        UC1(("Gửi Nhắc Nhở<br/>Uống Thuốc"))
        UC2(("Tạo Cảnh Báo<br/>Tuân Thủ Thấp"))
        UC3(("Xử Lý<br/>WebSocket Connections"))
    end
    
    %% Associations - Nét liền
    SYSTEM ---|>| UC1
    SYSTEM ---|>| UC2
    SYSTEM ---|>| UC3
    
    %% Styling
    style SYSTEM fill:#9b59b6,stroke:#6c3483,stroke-width:3px,color:#fff
    style UC1 fill:#ffd3b6,stroke:#333,stroke-width:2px
    style UC2 fill:#ffd3b6,stroke:#333,stroke-width:2px
    style UC3 fill:#ffd3b6,stroke:#333,stroke-width:2px
    style SYSTEM_MOD fill:#f0f0f0,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## Mối Quan Hệ Giữa Các Use Cases

### 1. Mối Quan Hệ Include (Bao gồm)

```mermaid
graph TD
    %% Use Cases - Hình tròn/oval
    A(("Xác Nhận Đã<br/>Uống Thuốc"))
    B(("Xác Thực<br/>Người Dùng"))
    C(("Validate<br/>Đơn Thuốc"))
    D(("Tạo<br/>AdherenceLog"))
    E(("Kê Đơn Thuốc<br/>Điện Tử"))
    F(("Validate<br/>Thuốc"))
    G(("Tạo<br/>Prescription"))
    
    %% Include relationships - Nét đứt với mũi tên
    A -.->|"&lt;&lt;include&gt;&gt;"| B
    A -.->|"&lt;&lt;include&gt;&gt;"| C
    A -.->|"&lt;&lt;include&gt;&gt;"| D
    
    E -.->|"&lt;&lt;include&gt;&gt;"| B
    E -.->|"&lt;&lt;include&gt;&gt;"| F
    E -.->|"&lt;&lt;include&gt;&gt;"| G
    
    %% Styling - Use Cases
    style A fill:#d4f1f4,stroke:#333,stroke-width:2px
    style E fill:#a8e6cf,stroke:#333,stroke-width:2px
    style B fill:#ffd3b6,stroke:#333,stroke-width:2px
    style C fill:#ffd3b6,stroke:#333,stroke-width:2px
    style D fill:#ffd3b6,stroke:#333,stroke-width:2px
    style F fill:#ffd3b6,stroke:#333,stroke-width:2px
    style G fill:#ffd3b6,stroke:#333,stroke-width:2px
```

### 2. Mối Quan Hệ Extend (Mở rộng)

```mermaid
graph TD
    %% Use Cases - Hình tròn/oval
    A(("Xác Nhận Đã<br/>Uống Thuốc"))
    B(("Đánh Dấu<br/>Bỏ Lỡ Thuốc"))
    C(("Uống Muộn"))
    D(("Uống Khác<br/>Liều"))
    E(("Kê Đơn Thuốc<br/>Điện Tử"))
    F(("Cảnh Báo<br/>Dị Ứng"))
    G(("Cảnh Báo Tương Tác<br/>Thuốc"))
    
    %% Extend relationships - Nét đứt với mũi tên
    B -.->|"&lt;&lt;extend&gt;&gt;"| A
    C -.->|"&lt;&lt;extend&gt;&gt;"| A
    D -.->|"&lt;&lt;extend&gt;&gt;"| A
    
    F -.->|"&lt;&lt;extend&gt;&gt;"| E
    G -.->|"&lt;&lt;extend&gt;&gt;"| E
    
    %% Styling - Use Cases
    style A fill:#d4f1f4,stroke:#333,stroke-width:2px
    style E fill:#a8e6cf,stroke:#333,stroke-width:2px
    style B fill:#ffd3b6,stroke:#333,stroke-width:2px
    style C fill:#ffd3b6,stroke:#333,stroke-width:2px
    style D fill:#ffd3b6,stroke:#333,stroke-width:2px
    style F fill:#ff9999,stroke:#333,stroke-width:2px
    style G fill:#ff9999,stroke:#333,stroke-width:2px
```

### 3. Luồng Tương Tác Giữa Các Actors

```mermaid
sequenceDiagram
    participant Admin
    participant Doctor
    participant Patient
    participant System
    
    Note over Admin: Quản lý hệ thống
    Admin->>System: Quản lý người dùng
    Admin->>System: Quản lý thuốc
    
    Note over Doctor: Điều trị bệnh nhân
    Doctor->>System: Kê đơn thuốc
    System->>Patient: Thông báo đơn thuốc mới
    
    Note over Patient: Uống thuốc
    System->>Patient: Nhắc nhở uống thuốc
    Patient->>System: Xác nhận đã uống
    
    Note over Doctor: Giám sát tuân thủ
    System->>Doctor: Cảnh báo tuân thủ thấp
    Doctor->>System: Xem lịch sử điều trị
```

## Mô Tả Chi Tiết Actors

### 1. Admin (Quản trị viên)
- **Mô tả**: Người quản trị hệ thống, có quyền cao nhất
- **Chức năng chính**:
  - Quản lý người dùng (tạo, sửa, xóa)
  - Quản lý chuyên khoa bác sĩ
  - Quản lý danh mục thuốc
  - Xem báo cáo tổng quan
  - Quản lý tất cả đơn thuốc
- **Use Cases**: UC-ADMIN-001 đến UC-ADMIN-005

### 2. Doctor (Bác sĩ)
- **Mô tả**: Bác sĩ điều trị, kê đơn thuốc cho bệnh nhân
- **Chức năng chính**:
  - Quản lý danh sách bệnh nhân được phân công
  - Kê đơn thuốc điện tử
  - Chỉnh sửa đơn thuốc
  - Giám sát tuân thủ uống thuốc của bệnh nhân
  - Xem lịch sử điều trị
- **Use Cases**: UC-DOCTOR-001 đến UC-DOCTOR-005

### 3. Patient (Bệnh nhân)
- **Mô tả**: Người dùng cuối, nhận đơn thuốc và xác nhận uống thuốc
- **Chức năng chính**:
  - Xem đơn thuốc hiện tại
  - Xem lịch nhắc uống thuốc
  - Xác nhận đã uống thuốc
  - Đánh dấu bỏ lỡ thuốc
  - Xem lịch sử dùng thuốc
  - Quản lý hồ sơ bệnh án
- **Use Cases**: UC-PATIENT-001 đến UC-PATIENT-006

### 4. System (Hệ thống)
- **Mô tả**: Hệ thống tự động thực hiện các tác vụ
- **Chức năng chính**:
  - Gửi nhắc nhở uống thuốc tự động
  - Tạo cảnh báo khi tuân thủ thấp
  - Xử lý kết nối WebSocket cho real-time notifications
- **Use Cases**: UC-SYSTEM-001 đến UC-SYSTEM-003

## Tổng Kết

### Lưu Ý Về Phân Rã Use Case

Các Use Case đã được phân rã thành các use case con chi tiết hơn với:

1. **Use Case Tổng Quát**: Ở level cao, mô tả chức năng chính
2. **Use Case Chi Tiết**: Ở level thấp, mô tả các bước cụ thể
3. **Include Relationship**: Sử dụng `---|includes|` để thể hiện use case chi tiết được bao gồm trong use case tổng quát
4. **Extend Relationship**: Sử dụng `-.->|"<<extends>>"|` để thể hiện use case có thể mở rộng use case khác
5. **System Boundary**: Sử dụng subgraph với border nét đứt để nhóm các use case chi tiết

### Thống Kê Use Cases

| Actor | Số Lượng Use Cases | Use Case IDs |
|-------|-------------------|--------------|
| Admin | 5 | UC-ADMIN-001 đến UC-ADMIN-005 |
| Doctor | 5 | UC-DOCTOR-001 đến UC-DOCTOR-005 |
| Patient | 6 | UC-PATIENT-001 đến UC-PATIENT-006 |
| System | 3 | UC-SYSTEM-001 đến UC-SYSTEM-003 |
| **Tổng** | **19** | - |

### Luồng Nghiệp Vụ Chính

1. **Luồng Kê Đơn và Uống Thuốc**:
   - Doctor → Kê đơn thuốc (UC-DOCTOR-002)
   - System → Gửi thông báo đơn thuốc mới
   - Patient → Xem đơn thuốc (UC-PATIENT-001)
   - System → Gửi nhắc nhở uống thuốc (UC-SYSTEM-001)
   - Patient → Xác nhận đã uống thuốc (UC-PATIENT-003)
   - System → Tạo cảnh báo tuân thủ thấp (UC-SYSTEM-002)
   - Doctor → Giám sát tuân thủ (UC-DOCTOR-004)

2. **Luồng Quản Trị**:
   - Admin → Quản lý người dùng (UC-ADMIN-001)
   - Admin → Quản lý thuốc (UC-ADMIN-003)
   - Admin → Xem báo cáo tổng quan (UC-ADMIN-004)

## Lợi Ích Của Use Case Diagram

1. **Hiểu rõ phạm vi**: Giúp hiểu rõ phạm vi và chức năng của hệ thống
2. **Thiết kế hệ thống**: Hỗ trợ thiết kế và phát triển hệ thống
3. **Tài liệu hóa**: Tài liệu hóa các chức năng cho team phát triển
4. **Giao tiếp**: Giúp giao tiếp giữa team về chức năng hệ thống
5. **Testing**: Hỗ trợ thiết kế test cases cho từng use case
6. **Quản lý dự án**: Giúp quản lý và theo dõi tiến độ dự án

