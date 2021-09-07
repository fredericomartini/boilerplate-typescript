require('dotenv-safe/config');

const validateParams = (extension, path, ignorePath) => {
  if (extension !== 'ts' && extension !== 'js') {
    throw new Error('extension must be (ts|js)');
  }

  if (path !== 'src' && path !== 'dist') {
    throw new Error('path must be (src|dist)');
  }

  if (ignorePath !== 'src' && ignorePath !== 'dist') {
    throw new Error('ignorePath must be (src|dist)');
  }
};

// Configs for js an ts
const getJestConfig = (extension, path, ignorePath, type) => {
  validateParams(extension, path, ignorePath);

  const testPathIgnorePatterns = ['/__mocks__/', '/jest/'];
  const testMatchAll = [`**/__tests__/**/*.test.${extension}`];

  const types = {
    UNITY: {
      testPathIgnorePatterns: [...testPathIgnorePatterns, '/__tests__/functional/'],
      testMatch: testMatchAll
    },
    FUNCTIONAL: {
      testPathIgnorePatterns,
      testMatch: [`**/__tests__/functional/**/*.test.${extension}`]
    },
    ALL: {
      testPathIgnorePatterns,
      testMatch: testMatchAll
    }
  };

  return {
    displayName: `Jest running ${type} tests on ${extension} files `,
    globalSetup: `<rootDir>/${path}/config/jest/globalSetup.${extension}`,
    globalTeardown: `<rootDir>/${path}/config/jest/globalTeardown.${extension}`,
    setupFilesAfterEnv: [`<rootDir>/${path}/config/jest/setup.${extension}`],
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@tests(.*)$': `<rootDir>/${path}/__tests__$1`,
      '^@config(.*)$': `<rootDir>/${path}/config$1`,
      '^@helpers(.*)$': `<rootDir>/${path}/common/helpers$1`,
      '^@middlewares(.*)$': `<rootDir>/${path}/common/middlewares$1`,
      '^@services(.*)$': `<rootDir>/${path}/common/services$1`,
      '^@adapters(.*)$': `<rootDir>/${path}/common/adapters$1`,
      '^@typeDefs(.*)$': `<rootDir>/${path}/common/typeDefs$1`,
      '^@modules(.*)$': `<rootDir>/${path}/modules$1`
    },
    modulePathIgnorePatterns: [`<rootDir>/${ignorePath}/`],
    coverageReporters: ['html', 'text'],
    collectCoverageFrom: [
      `<rootDir>/${path}/**/*.${extension}`,
      '!**/node_modules/**',
      '!**/vendor/**',
      '!**/__tests__/**',
      '!**/config/jest/**',
      `!**/${path}/index.${extension}`
    ],
    coverageThreshold: {
      global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100
      }
    },
    ...types[type || 'ALL']
  };
};

// Specific configs for each extension
const specificConfigs = {
  ts: {
    preset: 'ts-jest'
  }
};

const getTestType = (params) => {
  if (!Array.isArray(params)) {
    throw new Error('Params not array! ');
  }

  if (params.includes('FUNCTIONAL')) {
    return 'FUNCTIONAL';
  }

  if (params.includes('UNITY')) {
    return 'UNITY';
  }

  return 'ALL';
};

const getConfig = (environment = 'test', args) => {
  process.env.TESTING = true;
  const type = getTestType(args);

  return environment === 'local'
    ? { ...getJestConfig('ts', 'src', 'dist', type), ...specificConfigs.ts }
    : { ...getJestConfig('js', 'dist', 'src', type) };
};

module.exports = {
  ...getConfig(process.env.NODE_ENV, process.argv)
};
