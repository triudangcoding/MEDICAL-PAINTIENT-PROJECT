import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, DoctorFields, UpdateDoctorFieldsData } from '@/api/profile/profile.api';
import { majorApi } from '@/api/major/major.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  Lock,
  Stethoscope,
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface Major {
  id: string;
  code: string;
  name: string;
  nameEn?: string | null;
}

export default function DoctorInfo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [doctorData, setDoctorData] = useState<DoctorFields | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [formData, setFormData] = useState<UpdateDoctorFieldsData>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorResponse, majorsResponse] = await Promise.all([
        profileApi.getDoctorFields(),
        majorApi.getActiveMajors(),
      ]);
      setDoctorData(doctorResponse);
      setMajors(majorsResponse.data || []);
      setFormData({
        fullName: doctorResponse.fullName,
        phoneNumber: doctorResponse.phoneNumber,
        major: doctorResponse.majorDoctorId,
      });
    } catch (error: any) {
      console.error('Error loading doctor data:', error);
      toast.error('Không thể tải thông tin bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedData = await profileApi.updateDoctorFields(formData);
      setDoctorData(updatedData);
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      console.error('Error updating doctor data:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (doctorData) {
      setFormData({
        fullName: doctorData.fullName,
        phoneNumber: doctorData.phoneNumber,
        major: doctorData.majorDoctorId,
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

  if (!doctorData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Không thể tải thông tin bác sĩ</p>
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
            <h1 className="text-3xl font-bold">Thông tin bác sĩ</h1>
            <p className="text-muted-foreground">Quản lý thông tin cá nhân và chuyên khoa</p>
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
              <CardDescription>Thông tin cơ bản của bác sĩ</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="major">
                    <Stethoscope className="h-4 w-4 inline mr-2" />
                    Chuyên khoa
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.major}
                      onValueChange={(value) => setFormData({ ...formData, major: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chuyên khoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem key={major.id} value={major.id}>
                            {major.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {doctorData.majorDoctor.name}
                      </Badge>
                    </div>
                  )}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <Badge variant={doctorData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {doctorData.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày tạo</p>
                    <p className="font-semibold">{new Date(doctorData.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mã chuyên khoa</p>
                    <p className="font-semibold font-mono">{doctorData.majorDoctor.code}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyên khoa</CardTitle>
              <CardDescription>Chi tiết về chuyên khoa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tên tiếng Việt</Label>
                  <p className="text-lg font-semibold mt-1">{doctorData.majorDoctor.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tên tiếng Anh</Label>
                  <p className="text-lg font-semibold mt-1">{doctorData.majorDoctor.nameEn || 'N/A'}</p>
                </div>
              </div>
              {doctorData.majorDoctor.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="mt-1">{doctorData.majorDoctor.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

