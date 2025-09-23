interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const ModalCustom: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 opacity-30 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${
            width || "sm:max-w-lg"
          }`}
        >
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
