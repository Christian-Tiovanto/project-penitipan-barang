import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PermissionsMetatada = (
  ...permissions: string[]
): CustomDecorator => SetMetadata('permissions', permissions);
