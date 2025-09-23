import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IPatient } from "@/api/patient/types.patient"
import { patientApi } from "@/api/patient/patient.api"
import toast from "react-hot-toast"
import { useState } from "react"

interface ConfirmDeletePatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
  action: 'delete' | 'multiple-delete';
  patient?: IPatient;
  selectedIds?: string[];
}

export function ConfirmDeletePatientDialog({ 
  isOpen, 
  onClose, 
  onDeleteSuccess, 
  action, 
  patient,
  selectedIds 
}: ConfirmDeletePatientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation for single patient
  const handleConfirmDeleteSingle = async () => {
    if (!patient) return;
    
    setIsDeleting(true);
    try {
      // TODO: Implement deletePatient API method
      console.log("Deleting patient:", patient.id);
      await patientApi.deletePatient(patient.id);
      
      toast.success("Xóa bệnh nhân thành công");
      onDeleteSuccess();
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bệnh nhân");
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle delete confirmation for multiple patients
  const handleConfirmDeleteMultiple = async () => {
    if (!selectedIds || selectedIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      // TODO: Implement deletePatient API method
      console.log("Deleting patients:", selectedIds);
      await patientApi.deleteMultiplePatients(selectedIds);
      
      toast.success(`Xóa ${selectedIds.length} bệnh nhân thành công`);
      onDeleteSuccess();
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bệnh nhân");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleConfirm = () => {
    if (action === 'delete') {
      handleConfirmDeleteSingle();
    } else {
      handleConfirmDeleteMultiple();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">
            Xác nhận xóa bệnh nhân
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              {action === 'delete' 
                ? `Bạn có chắc chắn muốn xóa bệnh nhân "${patient?.fullName}" không?`
                : `Bạn có chắc chắn muốn xóa ${selectedIds?.length || 0} bệnh nhân đã chọn không?`
              }
            </p>
            <p className="text-red-600 dark:text-red-400 font-medium">
              <span className="font-bold">Lưu ý:</span> Hành động này không thể hoàn tác.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
  