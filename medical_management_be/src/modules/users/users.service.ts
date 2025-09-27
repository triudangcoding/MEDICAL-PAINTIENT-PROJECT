import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException
} from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { Utils } from '@/utils/utils';
import { LoggerService } from '@/core/logger/logger.service';
import { IUserFromToken } from '@/modules/users/types/user.type';
import RegisterDto from '@/core/auth/dtos/register.dto';
import { UserRole, UserStatus } from '@prisma/client';
import CollectUserInfoDto from './dtos/collect-user-info.dto';
import CreateDto from '@/modules/users/dtos/create.dto';
import { UpdatePatientDto, UpdateUserDto } from './dtos/update.dto';
import DeleteMultiplePatientsDto from './dtos/delete-multiple.dto';
import UpdateHealthAndExerciseDto from './dtos/update-health-issues.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService
  ) {}

  async createUser(user: RegisterDto) {
    const userExist = await this.databaseService.client.user.findFirst({
      where: { phoneNumber: user.phoneNumber }
    });
    if (userExist) {
      throw new UnprocessableEntityException('Người dùng đã tồn tại');
    }
    const newUser = await this.databaseService.client.user.create({
      data: {
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        password: user.password
      }
    });
    return newUser;
  }

  async verifyUser(phoneNumber: string) {
    const user = await this.databaseService.client.user.findUnique({
      where: { phoneNumber }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status !== UserStatus.INACTIVE) {
      throw new UnprocessableEntityException('User already verified');
    }
    await this.databaseService.client.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ACTIVE }
    });
    return user;
  }

  async validateUser(user: { phoneNumber: string; password: string }) {
    const userExist = await this.databaseService.client.user.findFirst({
      where: { phoneNumber: user.phoneNumber }
    });
    if (!userExist) {
      throw new UnprocessableEntityException('User not found');
    }
    if (!userExist.password) {
      throw new UnprocessableEntityException('User not found');
    }
    const isMatch = Utils.HashUtils.comparePassword(
      user.password,
      userExist.password
    );
    if (!isMatch) {
      throw new UnprocessableEntityException('Password is incorrect');
    }
    return userExist;
  }

  async updatePassword(id: string, password: string) {
    const newPassword = await Utils.HashUtils.hashPassword(password);
    await this.databaseService.client.user.update({
      where: { id },
      data: { password: newPassword }
    });
  }

  async initAdminAccount() {
    this.logger.verbose('Checking admin account ... 🧀');
    const isExits = await this.databaseService.client.user.findFirst({
      where: {
        phoneNumber: '0889001505'
      }
    });
    if (!isExits) {
      this.logger.verbose('Admin account does not exits, initialize ... ✨');
      const password = await Utils.HashUtils.hashPassword('admin001');
      await this.databaseService.client.user.create({
        data: {
          phoneNumber: '0889001505',
          password: password,
          fullName: 'Admin',
          role: UserRole.ADMIN
        }
      });
      this.logger.verbose('Admin account initialized successfully ✨');
    }
  }

  async initDoctorAccount() {
    this.logger.verbose('Checking doctor account ... 🧀');
    const isExits = await this.databaseService.client.user.findFirst({
      where: {
        phoneNumber: '0808080808'
      }
    });
    if (!isExits) {
      this.logger.verbose('Doctor account does not exits, initialize ... ✨');
      const password = await Utils.HashUtils.hashPassword('doctor001');
      await this.databaseService.client.user.create({
        data: {
          phoneNumber: '0808080808',
          password: password,
          fullName: 'Doctor',
          role: UserRole.DOCTOR
        }
      });
      this.logger.verbose('Doctor account initialized successfully ✨');
    }
  }

  async initPatientAccount() {
    this.logger.verbose('Checking patient account ... 🧀');
    const isExits = await this.databaseService.client.user.findFirst({
      where: {
        phoneNumber: '0909090909'
      }
    });
    if (!isExits) {
      this.logger.verbose('Patient account does not exits, initialize ... ✨');
      const password = await Utils.HashUtils.hashPassword('patient001');
      await this.databaseService.client.user.create({
        data: {
          phoneNumber: '0909090909',
          password: password,
          fullName: 'Nguyễn Văn A',
          role: UserRole.PATIENT
        }
      });
      this.logger.verbose('Patient account initialized successfully ✨');
    }
  }

  async getMe(user: IUserFromToken) {
    return this.databaseService.client.user.findUnique({
      where: { id: user.id },
      include: { profile: true, medicalHistory: true }
    });
  }

  async findById(id: string) {
    return this.databaseService.client.user.findUnique({
      where: { id },
      include: { profile: true, medicalHistory: true }
    });
  }

  async update(id: string, body: UpdateUserDto) {
    const userExist = await this.databaseService.client.user.findUnique({
      where: { id }
    });
    if (!userExist) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Nếu có thay đổi password, kiểm tra oldPassword
    if (body.password) {
      const isMatch = Utils.HashUtils.comparePassword(
        body.oldPassword,
        userExist.password
      );
      if (!isMatch) {
        throw new UnprocessableEntityException('Mật khẩu cũ không đúng');
      }
      // Mã hóa password mới
      body.password = await Utils.HashUtils.hashPassword(body.password);
    }

    // Xóa oldPassword khỏi data trước khi update
    const { oldPassword, ...updateData } = body;

    const user = await this.databaseService.client.user.update({
      where: { id },
      data: updateData
    });
    return user;
  }

  async adminListUsers(params: {
    role?: UserRole;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: any = { deletedAt: null };
    if (params.role) {
      where.role = params.role;
    }
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const orderByField = params.sortBy || 'createdAt';
    const orderDir = params.sortOrder || 'desc';
    const [items, total] = await Promise.all([
      this.databaseService.client.user.findMany({
        where,
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.databaseService.client.user.count({ where })
    ]);
    return { items, total, page, limit };
  }

  async adminCreateUser(data: RegisterDto) {
    return this.createUser(data);
  }

  async adminUpdateUser(id: string, data: UpdateUserDto) {
    return this.update(id, data);
  }

  async adminSoftDeleteUser(id: string) {
    const user = await this.databaseService.client.user.findUnique({
      where: { id }
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return this.databaseService.client.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async deletePatient(id: string) {
    // Kiểm tra bệnh nhân có tồn tại không
    const patient = await this.databaseService.client.user.findUnique({
      where: { id }
    });

    if (!patient) {
      throw new NotFoundException('Không tìm thấy bệnh nhân');
    }

    if (patient.role !== UserRole.PATIENT) {
      throw new UnprocessableEntityException(
        'Người dùng này không phải là bệnh nhân'
      );
    }

    // Xóa bệnh nhân (sẽ cascade delete các dữ liệu liên quan)
    await this.databaseService.client.user.delete({
      where: { id }
    });

    return {
      message: 'Xóa bệnh nhân thành công',
      deletedPatient: {
        id: patient.id,
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber
      }
    };
  }

  async deleteMultiplePatients(body: DeleteMultiplePatientsDto) {
    const { ids } = body;

    // Kiểm tra tất cả IDs cótồn tại và là bệnh nhân không
    const patients = await this.databaseService.client.user.findMany({
      where: {
        id: { in: ids },
        role: UserRole.PATIENT
      }
    });

    // Kiểm tra xem có bệnh nhân nào không tồn tại hoặc không phải là PATIENT
    const foundIds = patients.map((p) => p.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy bệnh nhân hoặc người dùng không phải là bệnh nhân với IDs: ${notFoundIds.join(', ')}`
      );
    }

    // Xóa tất cả bệnh nhân
    const deleteResult = await this.databaseService.client.user.deleteMany({
      where: {
        id: { in: ids },
        role: UserRole.PATIENT
      }
    });

    return {
      message: `Xóa thành công ${deleteResult.count} bệnh nhân`,
      deletedCount: deleteResult.count,
      deletedPatients: patients.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        phoneNumber: p.phoneNumber
      }))
    };
  }

  async delete(id: string) {
    const user = await this.databaseService.client.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.databaseService.client.user.delete({
      where: { id }
    });

    return {
      message: 'Xóa người dùng thành công',
      deletedUser: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber
      }
    };
  }

  async deleteMultiple(body: DeleteMultiplePatientsDto) {
    const { ids } = body;

    const Users = await this.databaseService.client.user.findMany({
      where: {
        id: { in: ids }
      }
    });

    const foundIds = Users.map((p) => p.id);
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với IDs ${notFoundIds.join(', ')}`
      );
    }

    const deleteResult = await this.databaseService.client.user.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return {
      message: `Xóa thành công ${deleteResult.count} người dùng`,
      deletedCount: deleteResult.count,
      deletedUsers: Users.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        phoneNumber: p.phoneNumber
      }))
    };
  }
}
