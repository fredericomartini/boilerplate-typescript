import { logError } from '@helpers/logger';
import { UnauthorizedError } from '@typeDefs/errors';
import Container from 'typedi';
import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';

export const getAccountbyToken = async (token: string) => {
  try {
    const api = Container.get(PermissionCheckerApi);
    const data = await api.me({ token });

    if (data.id_account) {
      return data;
    }
  } catch (error) {
    logError(error);
  }

  throw new UnauthorizedError();
};

export default getAccountbyToken;
