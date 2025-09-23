import React from "react";

const DoctorManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý bác sĩ
          </h1>
        </div>

        {/* Content Area - Empty */}
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Nội dung sẽ được thêm vào đây</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;