import { axiosInstance } from "../axios";
import { CreateProductServiceData, ProductServiceResponse, UpdateProductServiceData } from "./types";

export const productApi = {
    getProductServices: async (): Promise<ProductServiceResponse> => {
        const response = await axiosInstance.get("/product-services");
        return response.data;
    },

    createProductService: async (data: CreateProductServiceData): Promise<any> => {
        const response = await axiosInstance.post("/product-services", data);
        return response.data;
    },

    updateProductService: async (id: string, data: UpdateProductServiceData): Promise<any> => {
        const response = await axiosInstance.patch(`/product-services/${id}`, data);
        return response.data;
    },

    deleteProductService: async (id: string): Promise<any> => {
        const response = await axiosInstance.delete(`/product-services/${id}`);
        return response.data;
    },
};
