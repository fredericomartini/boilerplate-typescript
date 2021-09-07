export interface Service {
    ds_api_token: string
    cd_api_service: string
    ds_api_service: string
    id_api_service: string
    ds_url: string
    ts_created_at: string
}

export interface Permission {
    audience: [string]
    account: [string]
    customer: [string]
}

export interface Audience {
    id_audience: string
    nm_audience: string
    ds_audience: string
    ds_avatar_url: string
    cd_color: string
    ts_created_at: string
    permissions?: Permission
    services?: [Service]
    service?: Service
}

export interface Account {
    id_account: string
    ds_email: string
    nm_account: string
    ts_created_at: string
    audiences?: [Audience]
    audience?: Audience
}
