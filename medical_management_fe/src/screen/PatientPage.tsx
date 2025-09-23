import React from 'react'

export default function PatientPage() {
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý bệnh nhân</h1>
          <p className="text-muted-foreground">Quản lý thông tin bệnh nhân trong hệ thống</p>
        </div>

        {/* Content Area - Empty */}
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Nội dung sẽ được thêm vào đây</p>
          </div>
        </div>
      </div>
    </main>
  )
}