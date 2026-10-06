import type { DeviceRegisterInput } from '@biophonics/shared';
import { prisma } from '../../lib/prisma';

export async function registerDevice(userId: string, input: DeviceRegisterInput) {
  await prisma.deviceToken.upsert({
    where: { token: input.token },
    create: {
      userId,
      token: input.token,
      platform: input.platform,
      timezone: input.timezone,
    },
    update: {
      userId, // reassign if a different user logged into the same device
      platform: input.platform,
      timezone: input.timezone,
    },
  });
}

export async function unregisterDevice(token: string) {
  await prisma.deviceToken.deleteMany({
    where: { token },
  });
}
