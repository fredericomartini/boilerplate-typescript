import { PermissionType } from '.';

export interface PermissionBody {
    id_account: string,
    cd_role_permission: string,
    cd_permission_type: keyof typeof PermissionType,
    id_audience?: string,
    id_customer?: string
}
