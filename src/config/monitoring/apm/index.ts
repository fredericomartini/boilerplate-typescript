import * as apm from 'elastic-apm-node';

export default () => {
  if (process.env.TESTING !== 'true') {
    apm.start({
      serviceName: process.env.REPO_NAME,
      serverUrl: process.env.APM_SERVICE_URL,
      environment: process.env.NODE_ENV,
      captureExceptions: true
    });
  }
};
