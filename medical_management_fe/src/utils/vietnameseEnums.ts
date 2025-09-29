// Utility functions to convert English enums to Vietnamese

export function translateRoute(route: string): string {
  const routeMap: Record<string, string> = {
    'ORAL': 'Đường uống',
    'INHALATION': 'Đường hít',
    'INJECTION': 'Đường tiêm',
    'TOPICAL': 'Đường bôi',
    'SUBLINGUAL': 'Đường ngậm dưới lưỡi',
    'RECTAL': 'Đường trực tràng',
    'INTRAVENOUS': 'Đường tĩnh mạch',
    'INTRAMUSCULAR': 'Đường tiêm bắp',
    'SUBCUTANEOUS': 'Đường tiêm dưới da',
    'NASAL': 'Đường mũi',
    'OPHTHALMIC': 'Đường mắt',
    'OTIC': 'Đường tai',
    'VAGINAL': 'Đường âm đạo',
    'TRANSDERMAL': 'Đường qua da',
    'BUCCAL': 'Đường má',
    'INTRATHECAL': 'Đường tủy sống',
    'INTRAPERITONEAL': 'Đường phúc mạc',
    'INTRACARDIAC': 'Đường tim',
    'INTRACEREBRAL': 'Đường não',
    'INTRACEREBROVENTRICULAR': 'Đường não thất',
    'INTRACORONARY': 'Đường động mạch vành',
    'INTRADERMAL': 'Đường trong da',
    'INTRALESIONAL': 'Đường tổn thương',
    'INTRAMEDULLARY': 'Đường tủy xương',
    'INTRAPLEURAL': 'Đường màng phổi',
    'INTRASYNOVIAL': 'Đường khớp',
    'INTRATRACHEAL': 'Đường khí quản',
    'INTRATUMORAL': 'Đường khối u',
    'INTRATYMPANIC': 'Đường tai giữa',
    'INTRAUTERINE': 'Đường tử cung',
    'INTRAVESICAL': 'Đường bàng quang',
    'INTRAVITREAL': 'Đường dịch kính',
    'OTHER': 'Khác'
  };
  
  return routeMap[route] || route;
}

export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Chưa uống',
    'TAKEN': 'Đã uống',
    'MISSED': 'Đã bỏ lỡ',
    'SKIPPED': 'Đã bỏ qua',
    'ACTIVE': 'Đang điều trị',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'INACTIVE': 'Không hoạt động',
    'SUSPENDED': 'Tạm dừng',
    'EXPIRED': 'Đã hết hạn'
  };
  
  return statusMap[status] || status;
}

export function translateForm(form: string): string {
  const formMap: Record<string, string> = {
    'TABLET': 'Viên nén',
    'CAPSULE': 'Viên nang',
    'SYRUP': 'Si-rô',
    'DROPS': 'Giọt',
    'INJECTION': 'Tiêm',
    'CREAM': 'Kem',
    'OINTMENT': 'Thuốc mỡ',
    'GEL': 'Gel',
    'PATCH': 'Miếng dán',
    'POWDER': 'Bột',
    'SOLUTION': 'Dung dịch',
    'SUSPENSION': 'Huyền phù',
    'EMULSION': 'Nhũ tương',
    'SPRAY': 'Xịt',
    'INHALER': 'Ống hít',
    'PEN': 'Bút tiêm',
    'VIAL': 'Lọ',
    'AMPOULE': 'Ống tiêm',
    'SUPPOSITORY': 'Viên đặt',
    'PESSARY': 'Viên đặt âm đạo',
    'OTHER': 'Khác'
  };
  
  return formMap[form] || form;
}

export function translateTimeSlot(timeSlot: string): string {
  const timeMap: Record<string, string> = {
    'Sáng': 'Sáng',
    'Trưa': 'Trưa', 
    'Chiều': 'Chiều',
    'Tối': 'Tối',
    'Đêm': 'Đêm',
    'MORNING': 'Sáng',
    'AFTERNOON': 'Chiều',
    'EVENING': 'Tối',
    'NIGHT': 'Đêm',
    'NOON': 'Trưa'
  };
  
  return timeMap[timeSlot] || timeSlot;
}
