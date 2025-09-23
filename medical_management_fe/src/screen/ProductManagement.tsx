import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/product/product.api";
import {  toast } from "react-hot-toast";
import { CreateProductServiceData, ProductService, UpdateProductServiceData } from "../api/product/types";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <div
                    className="fixed inset-0 opacity-30 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                                    {title}
                                </h3>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductManagement: React.FC = () => {
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductService | null>(
        null
    );
    const [productForm, setProductForm] = useState<CreateProductServiceData>({
        name: "",
        description: "",
        price: 0,
        key: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const queryClient = useQueryClient();

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ["productServices"],
        queryFn: productApi.getProductServices,
    });

    const createProductMutation = useMutation({
        mutationFn: productApi.createProductService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productServices"] });
            toast.success("Tạo dịch vụ thành công");
            setIsAddingProduct(false);
            setProductForm({ name: "", description: "", price: 0, key: "" });
        },
        onError: () => {
            toast.error("Có lỗi xảy ra khi tạo dịch vụ");
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductServiceData }) =>
            productApi.updateProductService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productServices"] });
            toast.success("Cập nhật dịch vụ thành công");
            setEditingProduct(null);
            setProductForm({ name: "", description: "", price: 0, key: "" });
        },
        onError: () => {
            toast.error("Có lỗi xảy ra khi cập nhật dịch vụ");
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: productApi.deleteProductService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productServices"] });
            toast.success("Xóa dịch vụ thành công");
        },
        onError: () => {
            toast.error("Có lỗi xảy ra khi xóa dịch vụ");
        },
    });

    const handleAddProduct = () => {
        setIsAddingProduct(true);
        setProductForm({
            name: "",
            description: "",
            price: 0,
            key: "",
        });
    };

    const handleEditProduct = (product: ProductService) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            key: product.key,
        });
    };

    const handleDeleteProduct = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            deleteProductMutation.mutate(id);
        }
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            const updateData: UpdateProductServiceData = {
                name: productForm.name,
                description: productForm.description,
                price: productForm.price,
            };
            updateProductMutation.mutate({
                id: editingProduct.id,
                data: updateData,
            });
        } else {
            createProductMutation.mutate(productForm);
        }
    };

    const handleProductFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "price") {
            setProductForm((prev) => ({
                ...prev,
                [name]: Number(value),
            }));
        } else {
            setProductForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleGenerateKey = () => {
        if (productForm.name) {
            const key = productForm.name
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            setProductForm((prev) => ({
                ...prev,
                key,
            }));
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const filteredProducts = productsData?.data.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderProductForm = () => {
        return (
            <Modal
                isOpen={isAddingProduct || !!editingProduct}
                onClose={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    setProductForm({ name: "", description: "", price: 0, key: "" });
                }}
                title={editingProduct ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
            >
                <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên dịch vụ
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={productForm.name}
                            onChange={handleProductFormChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={productForm.description}
                            onChange={handleProductFormChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductFormChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            min="0"
                        />
                    </div>
                    {!editingProduct && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mã dịch vụ
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="key"
                                    value={productForm.key}
                                    onChange={handleProductFormChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateKey}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Tạo mã
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Mã dịch vụ sẽ được sử dụng trong URL và không thể thay đổi sau khi tạo
                            </p>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingProduct(false);
                                setEditingProduct(null);
                                setProductForm({ name: "", description: "", price: 0, key: "" });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {editingProduct ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    const renderProductCard = (product: ProductService) => (
        <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-3 h-20 overflow-hidden">
                    <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Mã: {product.key}</span>
                        <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProductList = (product: ProductService) => (
        <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-3 transition-all duration-300 hover:shadow-lg">
            <div className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                    <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500 mr-4">Mã: {product.key}</span>
                        <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
         
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý dịch vụ</h1>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dịch vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400">
                                    🔍
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                    <span>+</span>
                                    <span>Thêm dịch vụ</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoadingProducts ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => renderProductCard(product))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="text-6xl">📦</div>
                                    <h3 className="text-xl font-medium text-gray-700">
                                        {searchTerm ? "Không tìm thấy dịch vụ phù hợp" : "Chưa có dịch vụ nào"}
                                    </h3>
                                    {!searchTerm && (
                                        <>
                                            <p className="text-gray-500">Bắt đầu bằng cách thêm dịch vụ mới</p>
                                            <button
                                                onClick={handleAddProduct}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Thêm dịch vụ
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => renderProductList(product))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="text-6xl">📦</div>
                                    <h3 className="text-xl font-medium text-gray-700">
                                        {searchTerm ? "Không tìm thấy dịch vụ phù hợp" : "Chưa có dịch vụ nào"}
                                    </h3>
                                    {!searchTerm && (
                                        <>
                                            <p className="text-gray-500">Bắt đầu bằng cách thêm dịch vụ mới</p>
                                            <button
                                                onClick={handleAddProduct}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Thêm dịch vụ
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Statistics */}
                {filteredProducts && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Tổng số dịch vụ</p>
                                    <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Giá trung bình</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatPrice(
                                            filteredProducts.reduce((acc, product) => acc + product.price, 0) / filteredProducts.length
                                        )}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Dịch vụ đắt nhất</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatPrice(
                                            Math.max(...filteredProducts.map(product => product.price))
                                        )}
                                    </p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {renderProductForm()}
        </div>
    );
};

export default ProductManagement; 