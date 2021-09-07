import * as apm from '@config/monitoring/apm';
import startMonitoring from '@config/monitoring';
import * as logger from '@config/monitoring/logger';

describe('Tests for monitoring', () => {
  describe('When startMonitoring() called', () => {
    test('Should call startApm()', () => {
      const spy = jest.spyOn(apm, 'default');

      startMonitoring();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should call startLogger()', () => {
      const spy = jest.spyOn(logger, 'default');

      startMonitoring();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
