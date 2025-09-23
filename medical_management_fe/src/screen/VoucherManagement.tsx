import React, { useLayoutEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voucherApi } from "../api/voucher/voucher.api";
import {
  CreateVoucherData,
  UpdateVoucherData,
  Voucher,
  VoucherListResponse,
} from "../api/voucher/types";
import { toast } from "react-hot-toast";
import { ModalCustom } from "@/components/modal-custom";
import { AxiosError } from "axios";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnsTableVoucherMgmt } from "@/components/data-table/column-table/columns-table-voucher-mgmt";
import { DataTableCSR } from "@/components/data-table/data-table-CSR/data-table-CSR";

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

const VoucherManagement: React.FC = () => {
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [voucherForm, setVoucherForm] = useState<CreateVoucherData>({
    name: "",
    code: "",
    discount: 0,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [listColumns, setListColumns] = useState<ColumnDef<Voucher>[]>();

  const queryClient = useQueryClient();

  const { data: vouchersData, isLoading } = useQuery<
    VoucherListResponse,
    AxiosError<ApiError>
  >({
    queryKey: ["vouchers"],
    queryFn: voucherApi.getVouchers,
  });

  const createVoucherMutation = useMutation({
    mutationFn: voucherApi.createVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("🎉 Tạo voucher thành công!", toastConfig.success);
      setIsAddingVoucher(false);
      setVoucherForm({ name: "", code: "", discount: 0 });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo voucher. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherData }) =>
      voucherApi.updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("✨ Cập nhật voucher thành công!", toastConfig.success);
      setEditingVoucher(null);
      setVoucherForm({ name: "", code: "", discount: 0 });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật voucher. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: voucherApi.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      toast.success("🗑️ Xóa voucher thành công!", toastConfig.success);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa voucher. Vui lòng thử lại sau.",
        toastConfig.error
      );
    },
  });

  useLayoutEffect(() => {
    if (vouchersData) {
      let columnsTable = ColumnsTableVoucherMgmt;

      columnsTable = [
        ...columnsTable,
        {
          accessorKey: "actions",
          header: () => <>...</>,
          cell: ({ row }: { row: any }) => {
            const voucher = row.original;
            return (
              <div className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-start space-x-3">
                  <button
                    onClick={() => handleEditVoucher(voucher)}
                    className="text-primary hover:text-primary/90 transition-colors duration-200"
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
                    onClick={() => handleDeleteVoucher(voucher)}
                    className="text-destructive hover:text-destructive/90 transition-colors duration-200"
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
  }, [vouchersData]);

  const handleAddVoucher = () => {
    setIsAddingVoucher(true);
    setVoucherForm({ name: "", code: "", discount: 0 });
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      name: voucher.name,
      code: voucher.code,
      discount: voucher.discount,
    });
  };

  const handleDeleteVoucher = (voucher: Voucher) => {
    setVoucherToDelete(voucher);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (voucherToDelete) {
      deleteVoucherMutation.mutate(voucherToDelete.id);
      setIsDeleteModalOpen(false);
      setVoucherToDelete(null);
    }
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVoucher) {
      updateVoucherMutation.mutate({
        id: editingVoucher.id,
        data: {
          name: voucherForm.name,
          discount: voucherForm.discount,
        },
      });
    } else {
      createVoucherMutation.mutate(voucherForm);
    }
  };

  const handleVoucherFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVoucherForm((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) : value,
    }));
  };

  const renderVoucherForm = () => {
    return (
      <ModalCustom
        isOpen={isAddingVoucher || !!editingVoucher}
        onClose={() => {
          setIsAddingVoucher(false);
          setEditingVoucher(null);
          setVoucherForm({ name: "", code: "", discount: 0 });
        }}
        title={editingVoucher ? "Cập nhật voucher" : "Thêm voucher mới"}
      >
        <form onSubmit={handleVoucherSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên voucher
            </label>
            <input
              type="text"
              name="name"
              value={voucherForm.name}
              onChange={handleVoucherFormChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!editingVoucher && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã voucher
              </label>
              <input
                type="text"
                name="code"
                value={voucherForm.code}
                onChange={handleVoucherFormChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giảm giá (%)
            </label>
            <input
              type="number"
              name="discount"
              value={voucherForm.discount}
              onChange={handleVoucherFormChange}
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingVoucher(false);
                setEditingVoucher(null);
                setVoucherForm({ name: "", code: "", discount: 0 });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingVoucher ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </ModalCustom>
    );
  };

  const renderDeleteModal = () => {
    return (
      <ModalCustom
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVoucherToDelete(null);
        }}
        title=""
      >
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
            Bạn có chắc chắn muốn xóa voucher này?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              onClick={handleConfirmDelete}
            >
              Xóa
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setVoucherToDelete(null);
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </ModalCustom>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý voucher
            </h1>
            <button
              onClick={handleAddVoucher}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Thêm voucher</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <DataTableCSR
                data={vouchersData?.data || []}
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
                      Không có voucher nào
                    </p>
                    <p className="text-muted-foreground/70 mt-1">
                      Nhấn nút "Thêm voucher" để tạo voucher mới
                    </p>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
      {renderVoucherForm()}
      {renderDeleteModal()}
    </div>
  );
};

export default VoucherManagement;
