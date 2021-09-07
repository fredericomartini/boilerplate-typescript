import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';

@Service()
export default abstract class BaseApi {
  readonly service: AxiosInstance;

  constructor(baseURL: string, authToken: string, isBearer = true, extraHeaders: object = {}) {
    this.service = axios.create({
      baseURL,
      headers: {
        Authorization: isBearer ? `Bearer ${authToken}` : `${authToken}`,
        ...extraHeaders
      },
      timeout: 2 * 1000 // 2s
    });
  }
}
