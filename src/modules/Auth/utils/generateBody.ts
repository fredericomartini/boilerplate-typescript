import {
  PermissionBody, CheckPermissionParams, Permissions
} from '@modules/Auth/types';

export default ({
  id_account,
  permission,
  type,
  id_audience_or_id_customer
}: CheckPermissionParams): PermissionBody => {
  const types = {
    audience: () => ({
      id_account,
      cd_role_permission: Permissions[permission],
      cd_permission_type: type,
      id_audience: id_audience_or_id_customer
    }),
    customer: () => ({
      id_account,
      cd_role_permission: Permissions[permission],
      cd_permission_type: type,
      id_customer: id_audience_or_id_customer
    }),
    account: () => ({
      id_account,
      cd_role_permission: Permissions[permission],
      cd_permission_type: type
    })
  };

  return types[type]();
};
