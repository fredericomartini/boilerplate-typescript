import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

import PermissionCheckerAPI from '@modules/Auth/PermissionCheckerApi';
import { Permissions, PermissionType } from '@modules/Auth/types';
import { AccessForbiddenError } from '@typeDefs/errors';
import { logError } from '@helpers/logger';

function hasPermission(permission: keyof typeof Permissions, type: keyof typeof PermissionType = 'audience') {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const { id_account, audience } = req.account!;

      const params = {
        permission,
        type,
        id_account,
        id_audience_or_id_customer: audience?.id_audience
      };

      const permissionCheckerAPI = Container.get(PermissionCheckerAPI);

      if (!await permissionCheckerAPI.checkPermission(params)) {
        throw new AccessForbiddenError();
      }

      next();
    } catch (error) {
      logError(error);
      next(error);
    }
  };
}

export default hasPermission;
