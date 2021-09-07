import { Permissions, PermissionType } from '.';

export interface CheckPermissionParams {
    id_account: string,
    permission: keyof typeof Permissions,
    type: keyof typeof PermissionType,
    id_audience_or_id_customer?: string
}
