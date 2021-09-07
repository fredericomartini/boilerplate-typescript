import BaseApi from '@services/BaseApi';
import Cache from '@services/Cache';
import { AxiosResponse } from 'axios';
import { Service } from 'typedi';
import { CheckPermissionParams, Account, MeParams } from './types';
import { generateBody } from './utils';

interface ResponseMe {
  success: boolean,
  data: Account,
}

interface ResponseCheckPermission {
  success: boolean,
  granted: boolean,
}

@Service()
export default class PermissionCheckerApi extends BaseApi {
  readonly cache: Cache;

  constructor(cache: Cache) {
    const baseUrl = process.env.PERMISSION_CHECKER_URL as string;
    const token = process.env.PERMISSION_CHECKER_TOKEN as string;
    const headers = {
      'Content-Type': 'application/json'
    };

    super(baseUrl, token, false, headers);
    this.cache = cache;
  }

  async checkPermission(params: CheckPermissionParams): Promise<Boolean> {
    const key = `check-permission:${JSON.stringify(params)}`;

    if (await this.cache.exists(key)) {
      return await this.cache.get(key) === true;
    }

    const {
      data: {
        granted
      }
    }: AxiosResponse<ResponseCheckPermission> = await
    this.service.post('/check-permission', generateBody(
      params
    ));

    await this.cache.set(key, granted === true);

    return granted === true;
  }

  async me({
    token,
    permissions = false,
    services = false
  }: MeParams): Promise<Account> {
    const key = `me:${token}:permissions:${permissions}:services:${services}`;

    if (await this.cache.exists(key)) {
      return await this.cache.get(key) as Account;
    }

    const {
      data: {
        data
      }
    }: AxiosResponse<ResponseMe> = await this.service.get(
      `/me?token=${token}&permissions=${permissions}&services=${services}`
    );

    await this.cache.set(key, data);

    return data;
  }
}
