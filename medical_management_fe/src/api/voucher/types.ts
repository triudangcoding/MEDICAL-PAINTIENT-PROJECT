export interface Voucher {
  id: string;
  name: string;
  code: string;
  discount: number;
  productServices: any[]; // You can define a more specific type if needed
}

export interface CreateVoucherData {
  name: string;
  code: string;
  discount: number;
}

export interface UpdateVoucherData {
  name: string;
  discount: number;
}

export interface VoucherResponse {
  data: Voucher;
  statusCode: number;
}

export interface VoucherListResponse {
  data: Voucher[];
  statusCode: number;
}
