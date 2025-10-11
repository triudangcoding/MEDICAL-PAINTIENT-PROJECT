import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, PatientFields, UpdatePatientFieldsData } from '@/api/profile/profile.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  Lock,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  Stethoscope,
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
        gender: response.profile?.gender,
        birthDate: response.profile?.birthDate || '',
        address: response.profile?.address,
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
        gender: patientData.profile?.gender,
        birthDate: patientData.profile?.birthDate || '',
        address: patientData.profile?.address,
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

      {/* Thông tin cơ bản */}
      <div className="space-y-6">
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
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        <User className="h-4 w-4 inline mr-2" />
                        Giới tính
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Nam</SelectItem>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Ngày sinh
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        placeholder="Chọn ngày sinh"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Địa chỉ
                      </Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
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
        </div>
    </div>
  );
}

