

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: string;
  status: string;
}

export interface ProductService {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  time: number;
  descriptionKey: string[];
  price: number;
  key: string;
  voucherId: string | null;
  orderId: string | null;
}

export interface Voucher {
  id: string;
  name: string;
  code: string;
  discount: number;
}

export interface Schedule {
  id: string;
  userId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  lastPrice: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  productServiceId: string;
  voucherId: string | null;
  scheduleId: string | null;
  user: User;
  productServices: ProductService;
  voucher: Voucher | null;
  schedule: Schedule | null;
}

export interface CreateOrderData {
  userId: string;
  productServiceId: string;
  voucherId?: string;
  scheduleId?: string;
  totalPrice?: number;
}

export interface UpdateOrderData {
  status?: "PENDING" | "PAID" | "CANCELLED";
  voucherId?: string;
  totalPrice?: number;
  scheduleId?: string;
}

export interface OrderResponse {
  data: Order;
  statusCode: number;
}

export interface OrderListResponse {
  data: Order[];
  statusCode: number;
}
