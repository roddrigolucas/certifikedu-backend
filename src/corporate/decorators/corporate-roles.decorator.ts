import { SetMetadata } from '@nestjs/common';

export const CorporateRoles = (...roles: string[]) => SetMetadata('pjroles', roles);
