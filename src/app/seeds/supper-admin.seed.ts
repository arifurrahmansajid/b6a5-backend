import { Role, UserStatus } from "@/generated/prisma/enums";
import { getConfig } from "../config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  const config = getConfig();
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: config.superAdmin.email,
        password: config.superAdmin.password,
        name: "Super Admin",
        role: Role.SUPER_ADMIN,
      },
    });

    const superAdmin = await prisma.user.update({
      where: {
        id: result.user.id,
      },
      data: {
        emailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });

    console.log("Super Admin Created ", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: config.superAdmin.email,
      },
    });
  }
};
