import { registerAs } from '@nestjs/config';

export default registerAs(
  'refresh-jwt',
  () =>
    ({
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!,
    }) as const,
);
