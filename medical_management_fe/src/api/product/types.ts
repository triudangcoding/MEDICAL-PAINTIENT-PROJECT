export interface ProductService {
    id: string;
    name: string;
    description: string;
    price: number;
    key: string;
    voucherId: string | null;
    orderId: string | null;
    voucher: any | null;
}

export interface CreateProductServiceData {
    name: string;
    description: string;
    price: number;
    key: string;
}

export interface UpdateProductServiceData {
    name?: string;
    description?: string;
    price?: number;
}

export interface ProductServiceResponse {
    data: ProductService[];
    statusCode: number;
}