import { UserRole } from "@prisma/client";

export interface IUserFromToken {
  id: string;
  phoneNumber: string;
  fullName: string;
  roles: UserRole
}
