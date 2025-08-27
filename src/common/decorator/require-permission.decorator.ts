import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission_required';

export interface RequiredPermission {
  moduleId?: string;
  moduleName?: string;
  path?: string;
  method?: string;
  action?: string;
}

export const RequirePermission = (permission: RequiredPermission) =>
  SetMetadata(PERMISSION_KEY, permission);
