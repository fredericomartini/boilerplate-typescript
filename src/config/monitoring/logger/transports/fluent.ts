import { support } from 'fluent-logger';

export const TAG = `${process.env.NODE_ENV}.backend.${process.env.REPO_NAME}`;

export const getConfig = () => {
  if (process.env.FLUENT !== 'true') {
    return {};
  }

  if (!process.env.FLUENT_HOST || !process.env.FLUENT_PORT) {
    throw new Error('Variables FLUENT_HOST || FLUENT_PORT not found');
  }

  return {
    host: process.env.FLUENT_HOST,
    port: process.env.FLUENT_PORT,
    timeout: 2.0
  };
};

const fluentTransport = () => {
  const FluentTransport = support.winstonTransport();

  return new FluentTransport(TAG, getConfig());
};

export default fluentTransport;
