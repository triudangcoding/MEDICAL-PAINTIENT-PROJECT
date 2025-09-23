import React, { useLayoutEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order/order.api";
import { doctorApi } from "../api/doctor/doctor.api";
import { productApi } from "../api/product/product.api";
import { voucherApi } from "../api/voucher/voucher.api";
import {
  CreateOrderData,
  Order,
  OrderListResponse,
  UpdateOrderData,
} from "../api/order/types";
import { toast } from "react-hot-toast";
import { ModalCustom } from "@/components/modal-custom";
import { AxiosError } from "axios";
import { User } from "../api/doctor/types";
import { ProductService } from "../api/product/types";
import { Voucher } from "../api/voucher/types";
import { DoctorSchedule } from "../api/doctor/types";
import { DataTableCSR } from "@/components/data-table/data-table-CSR/data-table-CSR";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnsTableOrderMgmt } from "@/components/data-table/column-table/columns-table-order-mgmt";

interface ApiError {
  message: string;
}

const toastConfig = {
  success: {
    duration: 3000,
    position: "top-right" as const,
    style: {
      background: "#10B981",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
  },
  error: {
    duration: 4000,
    position: "top-right" as const,
    style: {
      background: "#EF4444",
      color: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
  },
  confirm: {
    duration: 5000,
    position: "top-center" as const,
    style: {
      background: "#fff",
      color: "#1F2937",
      borderRadius: "8px",
      padding: "16px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
  },
};

const OrderManagement: React.FC = () => {
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [listColumns, setListColumns] = useState<ColumnDef<Order>[]>();
  const [orderForm, setOrderForm] = useState<
    CreateOrderData & { totalPrice?: number }
  >({
    userId: "",
    productServiceId: "",
    voucherId: "",
    scheduleId: "",
    totalPrice: 0,
  });
  const [selectedMajorDoctor, setSelectedMajorDoctor] = useState<
    "DINH_DUONG" | "TAM_THAN" | ""
  >("");

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<OrderListResponse>({
    queryKey: ["orders"],
    queryFn: orderApi.getOrders,
  });

  const { data: patientList } = useQuery({
    queryKey: ["patientList"],
    queryFn: doctorApi.getPatientList,
  });

  const { data: productServices } = useQuery({
    queryKey: ["productServices"],
    queryFn: productApi.getProductServices,
  });

  const { data: vouchers } = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherApi.getVouchers,
  });

  const { data: doctorSchedules } = useQuery({
    queryKey: ["doctorSchedules", selectedMajorDoctor],
    queryFn: () => doctorApi.getDoctorSchedules(),
    enabled: !!selectedMajorDoctor,
  });

  const createOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("🎉 Tạo đơn hàng thành công!", toastConfig.success);
      setIsAddingOrder(false);
      setOrderForm({
        userId: "",
        productServiceId: "",
        voucherId: "",
        scheduleId: "",
        totalPrice: 0,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo đơn hàng. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderData }) =>
      orderApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("✨ Cập nhật đơn hàng thành công!", toastConfig.success);
      setEditingOrder(null);
      setOrderForm({
        userId: "",
        productServiceId: "",
        voucherId: "",
        scheduleId: "",
        totalPrice: 0,
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật đơn hàng. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("🗑️ Xóa đơn hàng thành công!", toastConfig.success);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa đơn hàng. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  const handleAddOrder = () => {
    setIsAddingOrder(true);
    setOrderForm({
      userId: "",
      productServiceId: "",
      voucherId: "",
      scheduleId: "",
      totalPrice: 0,
    });
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderForm({
      userId: order.userId,
      productServiceId: order.productServiceId,
      voucherId: order.voucherId || "",
      scheduleId: order.scheduleId || "",
      totalPrice: order.totalPrice,
    });
  };

  const handleDeleteOrder = (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Xác nhận xóa đơn hàng
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn
            tác.
          </p>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              onClick={() => {
                toast.dismiss(t.id);
                deleteOrderMutation.mutate(id);
              }}
            >
              Xóa
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      toastConfig.confirm
    );
  };

  useLayoutEffect(() => {
    if (ordersData) {
      let columnsTable = ColumnsTableOrderMgmt;

      columnsTable = [
        ...columnsTable,
        {
          accessorKey: "actions",
          header: () => <>...</>,
          cell: ({ row }: { row: any }) => {
            const order = row.original;
            return (
              <div className="py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="text-primary hover:text-primary/90 transition-colors duration-200 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-destructive hover:text-destructive/90 transition-colors duration-200 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          },
        },
      ];

      setListColumns(columnsTable);
    }
  }, [ordersData]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      updateOrderMutation.mutate({
        id: editingOrder.id,
        data: {
          status: "PAID",
          voucherId: orderForm.voucherId,
          totalPrice: orderForm.totalPrice,
          scheduleId: orderForm.scheduleId,
        },
      });
    } else {
      createOrderMutation.mutate(orderForm);
    }
  };

  const handleOrderFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: name === "totalPrice" ? Number(value) : value,
    }));
  };

  const handleMajorDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "DINH_DUONG" | "TAM_THAN" | "";
    setSelectedMajorDoctor(value);
    setOrderForm((prev) => ({
      ...prev,
      scheduleId: "", // Reset schedule selection when changing major doctor
    }));
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderForm = () => {
    return (
      <ModalCustom
        isOpen={isAddingOrder || !!editingOrder}
        onClose={() => {
          setIsAddingOrder(false);
          setEditingOrder(null);
          setSelectedMajorDoctor("");
          setOrderForm({
            userId: "",
            productServiceId: "",
            voucherId: "",
            scheduleId: "",
            totalPrice: 0,
          });
        }}
        title={editingOrder ? "Cập nhật đơn hàng" : "Thêm đơn hàng mới"}
      >
        <form onSubmit={handleOrderSubmit} className="space-y-4">
          {!editingOrder && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bệnh nhân
                </label>
                <select
                  name="userId"
                  value={orderForm.userId}
                  onChange={handleOrderFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patientList?.data.map((patient: User) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sản phẩm/Dịch vụ
                </label>
                <select
                  name="productServiceId"
                  value={orderForm.productServiceId}
                  onChange={handleOrderFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn sản phẩm/dịch vụ</option>
                  {productServices?.data.map((product: ProductService) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price.toLocaleString("vi-VN")}đ
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voucher
            </label>
            <select
              name="voucherId"
              value={orderForm.voucherId}
              onChange={handleOrderFormChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn voucher</option>
              {vouchers?.data.map((voucher: Voucher) => (
                <option key={voucher.id} value={voucher.id}>
                  {voucher.name} - Giảm {voucher.discount}%
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn chuyên gia
              </label>
              <select
                value={selectedMajorDoctor}
                onChange={handleMajorDoctorChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn chuyên gia</option>
                <option value="DINH_DUONG">Chuyên gia Dinh dưỡng</option>
                <option value="TAM_THAN">Chuyên gia Tâm thần</option>
              </select>
            </div>

            {selectedMajorDoctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lịch hẹn
                </label>
                <select
                  name="scheduleId"
                  value={orderForm.scheduleId}
                  onChange={handleOrderFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn lịch hẹn</option>
                  {doctorSchedules?.data
                    .filter((schedule) => schedule.status === "FREE")
                    .map((schedule: DoctorSchedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.user.fullName} |{" "}
                        {formatDateTime(schedule.startDate)}
                      </option>
                    ))}
                </select>
                {doctorSchedules?.data.filter(
                  (schedule) => schedule.status === "FREE"
                ).length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Không có lịch hẹn nào còn trống cho chuyên gia này.
                  </p>
                )}
              </div>
            )}
          </div>
          {editingOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng tiền
              </label>
              <input
                type="number"
                name="totalPrice"
                value={orderForm.totalPrice}
                onChange={handleOrderFormChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingOrder(false);
                setEditingOrder(null);
                setOrderForm({
                  userId: "",
                  productServiceId: "",
                  voucherId: "",
                  scheduleId: "",
                  totalPrice: 0,
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingOrder ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </ModalCustom>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý đơn hàng
            </h1>
            <button
              onClick={handleAddOrder}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Thêm đơn hàng</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <DataTableCSR
                data={ordersData?.data || []}
                columns={listColumns || []}
                noResults={
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Không có đơn hàng nào
                    </p>
                    <p className="text-muted-foreground/70 mt-1">
                      Nhấn nút "Thêm đơn hàng" để tạo đơn hàng mới
                    </p>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
      {renderOrderForm()}
    </div>
  );
};

export default OrderManagement;
