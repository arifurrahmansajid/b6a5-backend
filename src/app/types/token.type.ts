import type { Role, UserStatus, UserType, UserTypeStatus } from "@/generated/prisma/enums";

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  userTypes: {
    type: UserType;
    status: UserTypeStatus;
  }[];
}
