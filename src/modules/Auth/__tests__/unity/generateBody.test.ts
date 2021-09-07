import { generateBody } from '@modules/Auth/utils';

describe('Tests for generateBody()', () => {
  describe('Should parse data to valid format', () => {
    const id_account = 'xxx123';
    const permission = 'LOGIN';
    const cd_role_permission = 'api.back.auth.login';
    const id_audience_or_id_customer = '123456';

    test('When type = audience', () => {
      const type = 'audience';
      const expected = {
        id_account,
        cd_role_permission,
        cd_permission_type: type,
        id_audience: id_audience_or_id_customer
      };

      expect(
        generateBody({
          permission, type, id_account, id_audience_or_id_customer
        })
      ).toStrictEqual(expected);
    });

    test('When type = account', () => {
      const type = 'account';
      const expected = {
        id_account,
        cd_role_permission,
        cd_permission_type: type
      };

      const response = generateBody({
        permission, type, id_account, id_audience_or_id_customer
      });

      expect(response).toStrictEqual(expected);
    });

    test('When type = customer', () => {
      const type = 'customer';
      const expected = {
        id_account,
        cd_role_permission,
        cd_permission_type: type,
        id_customer: id_audience_or_id_customer
      };

      const response = generateBody({
        permission, type, id_account, id_audience_or_id_customer
      });

      expect(response).toStrictEqual(expected);
    });
  });
});
