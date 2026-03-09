import { SetMetadata } from '@nestjs/common';

export const PJRoles = (...roles: string[]) => SetMetadata('pjroles', roles);
