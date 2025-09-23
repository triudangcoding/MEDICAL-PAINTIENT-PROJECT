import React from "react";

const DashboardHomepage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Chào mừng trở lại!</h1>
          <p className="text-xs text-muted-foreground">
            Tổng quan hoạt động hôm nay
          </p>
        </div>
      </div>

      {/* Content Area - Empty */}
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Nội dung sẽ được thêm vào đây</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomepage;
