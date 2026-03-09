import { SetMetadata } from '@nestjs/common';

export const CanvasRoles = (...roles: string[]) => SetMetadata('canvasRoles', roles);
