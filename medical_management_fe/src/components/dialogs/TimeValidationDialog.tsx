import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';

interface TimeValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  medicationName: string;
  timeSlot: string;
  currentTimeSlot: string;
}

export function TimeValidationDialog({
  open,
  onOpenChange,
  onConfirm,
  medicationName,
  timeSlot,
  currentTimeSlot,
}: TimeValidationDialogProps) {
  console.log('=== TIME VALIDATION DIALOG RENDER ===');
  console.log('Open:', open);
  console.log('Medication:', medicationName);
  console.log('Time slot:', timeSlot);
  console.log('Current time slot:', currentTimeSlot);

  const handleConfirm = () => {
    console.log('Dialog confirm clicked');
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận ngoài khung giờ
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Bạn đang xác nhận uống thuốc <strong>{medicationName}</strong></span>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg space-y-2">
              <div className="text-sm">
                <span className="font-medium">Khung giờ dự kiến:</span> {timeSlot}
              </div>
              <div className="text-sm">
                <span className="font-medium">Thời gian hiện tại:</span> {currentTimeSlot}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xác nhận uống thuốc vào thời điểm này không?
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Xác nhận uống thuốc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
