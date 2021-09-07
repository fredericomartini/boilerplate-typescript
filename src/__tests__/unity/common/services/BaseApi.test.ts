/* eslint-disable max-classes-per-file */
import BaseApi from '@services/BaseApi';
import Axios from 'axios';

let axiosCreateSpy: jest.SpyInstance;
const baseUrl = 'my-super-api.com';
const token = 'abc';

beforeEach(() => {
  axiosCreateSpy = jest.spyOn(Axios, 'create').mockImplementation();
});

describe('Default values', () => {
  class MyDefaultApi extends BaseApi {
    constructor() {
      super(baseUrl, token);
    }
  }

  test('Should create Api with default values', () => {
    const api = new MyDefaultApi();

    expect(api).toBeDefined();
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 2000
    });
  });
});

describe('When isBearer = false', () => {
  class MyApiWithoutBearer extends BaseApi {
    constructor() {
      super(baseUrl, token, false);
    }
  }

  test('Authorization without Bearer', () => {
    const api = new MyApiWithoutBearer();

    expect(api).toBeDefined();
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: baseUrl,
      headers: {
        Authorization: 'abc'
      },
      timeout: 2000
    });
  });
});

describe('When extra Headers', () => {
  const extraHeaders = {
    'Content-type': 'application/json',
    'my-other-header': 'other'
  };

  class MyApiWithExtraHeaders extends BaseApi {
    constructor() {
      super(baseUrl, token, false, extraHeaders);
    }
  }

  test('Should have passed extra headers', () => {
    const api = new MyApiWithExtraHeaders();

    expect(api).toBeDefined();
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: baseUrl,
      headers: {
        Authorization: 'abc',
        ...extraHeaders
      },
      timeout: 2000
    });
  });
});
