import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, PatientFields, UpdatePatientFieldsData } from '@/api/profile/profile.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  Lock,
  MapPin,
  Calendar,
  Heart,
  FileText,
  Bell,
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  Activity,
  Pill,
  TrendingUp,
  Stethoscope,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function PatientInfo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientFields | null>(null);
  const [formData, setFormData] = useState<UpdatePatientFieldsData>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getPatientFields();
      setPatientData(response);
      setFormData({
        fullName: response.fullName,
        phoneNumber: response.phoneNumber,
      });
    } catch (error: any) {
      console.error('Error loading patient data:', error);
      toast.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedData = await profileApi.updatePatientFields(formData);
      setPatientData(updatedData);
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      console.error('Error updating patient data:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (patientData) {
      setFormData({
        fullName: patientData.fullName,
        phoneNumber: patientData.phoneNumber,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Không thể tải thông tin bệnh nhân</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Thông tin bệnh nhân</h1>
            <p className="text-muted-foreground">Quản lý hồ sơ sức khỏe và thông tin cá nhân</p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">
            <User className="h-4 w-4 mr-2" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="health">
            <Heart className="h-4 w-4 mr-2" />
            Sức khỏe
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <Pill className="h-4 w-4 mr-2" />
            Đơn thuốc
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Activity className="h-4 w-4 mr-2" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        {/* Thông tin cơ bản */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin cơ bản của bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="h-4 w-4 inline mr-2" />
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Số điện thoại
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Mật khẩu mới (tùy chọn)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Nhập mật khẩu mới nếu muốn thay đổi"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Thông tin hồ sơ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Giới tính</p>
                      <p className="font-semibold">
                        {patientData.profile?.gender === 'MALE' ? 'Nam' : 
                         patientData.profile?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày sinh</p>
                      <p className="font-semibold">
                        {patientData.profile?.birthDate 
                          ? new Date(patientData.profile.birthDate).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="font-semibold truncate">{patientData.profile?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {patientData.createdByUser && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-3">Bác sĩ phụ trách</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{patientData.createdByUser.fullName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {patientData.createdByUser.phoneNumber}
                        </p>
                        {patientData.createdByUser.majorDoctor && (
                          <Badge variant="secondary" className="mt-2">
                            {patientData.createdByUser.majorDoctor.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sức khỏe */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử bệnh án</CardTitle>
              <CardDescription>Thông tin sức khỏe và tiền sử bệnh</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {patientData.medicalHistory ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Bệnh lý</Label>
                      <div className="flex flex-wrap gap-2">
                        {patientData.medicalHistory.conditions?.length > 0 ? (
                          patientData.medicalHistory.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline">{condition}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Không có</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Dị ứng</Label>
                      <div className="flex flex-wrap gap-2">
                        {patientData.medicalHistory.allergies?.length > 0 ? (
                          patientData.medicalHistory.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive">{allergy}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Không có</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Phẫu thuật</Label>
                      <div className="flex flex-wrap gap-2">
                        {patientData.medicalHistory.surgeries?.length > 0 ? (
                          patientData.medicalHistory.surgeries.map((surgery, index) => (
                            <Badge key={index} variant="secondary">{surgery}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Không có</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Thuốc đang dùng</Label>
                      <div className="flex flex-wrap gap-2">
                        {patientData.medicalHistory.currentMedications?.length > 0 ? (
                          patientData.medicalHistory.currentMedications.map((med, index) => (
                            <Badge key={index} variant="outline">{med}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Không có</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {patientData.medicalHistory.familyHistory && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Tiền sử gia đình</Label>
                      <p className="text-sm">{patientData.medicalHistory.familyHistory}</p>
                    </div>
                  )}

                  {patientData.medicalHistory.lifestyle && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Lối sống</Label>
                      <p className="text-sm">{patientData.medicalHistory.lifestyle}</p>
                    </div>
                  )}

                  {patientData.medicalHistory.notes && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Ghi chú</Label>
                      <p className="text-sm">{patientData.medicalHistory.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có thông tin bệnh án</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Đơn thuốc */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Đơn thuốc gần đây</CardTitle>
              <CardDescription>Các đơn thuốc được kê cho bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {patientData.prescriptionsAsPatient.length > 0 ? (
                <div className="space-y-4">
                  {patientData.prescriptionsAsPatient.map((prescription: any) => (
                    <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={prescription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ngày kê: {new Date(prescription.startDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {prescription.doctor && (
                          <div className="text-right">
                            <p className="font-semibold text-sm">{prescription.doctor.fullName}</p>
                            {prescription.doctor.majorDoctor && (
                              <Badge variant="outline" className="text-xs">
                                {prescription.doctor.majorDoctor.name}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {prescription.items && prescription.items.length > 0 && (
                        <div className="space-y-2 mt-3 pt-3 border-t">
                          <p className="text-sm font-medium">Thuốc:</p>
                          {prescription.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded">
                              <Pill className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{item.medication.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.dosage} - {item.frequencyPerDay} lần/ngày - {item.durationDays} ngày
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có đơn thuốc nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thống kê */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Đơn thuốc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{patientData.stats.totalPrescriptions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {patientData.stats.activePrescriptions} đang hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Đã uống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{patientData.stats.takenLogs}</p>
                <p className="text-xs text-muted-foreground mt-1">Lần đã uống thuốc</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Bỏ lỡ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{patientData.stats.missedLogs}</p>
                <p className="text-xs text-muted-foreground mt-1">Lần bỏ lỡ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tuân thủ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{patientData.stats.adherenceRate}%</p>
                <Progress value={patientData.stats.adherenceRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo</CardTitle>
              <CardDescription>Thông báo từ bác sĩ</CardDescription>
            </CardHeader>
            <CardContent>
              {patientData.alertsAsPatient.length > 0 ? (
                <div className="space-y-3">
                  {patientData.alertsAsPatient.map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${alert.resolved ? 'bg-secondary' : 'bg-red-100'}`}>
                        <Bell className={`h-5 w-5 ${alert.resolved ? 'text-muted-foreground' : 'text-red-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                            {alert.type}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        {alert.doctor && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Từ: {alert.doctor.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có cảnh báo nào</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

