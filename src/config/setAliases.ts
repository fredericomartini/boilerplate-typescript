import * as moduleAlias from 'module-alias';

enum Types {
    js = 'js',
    ts = 'ts'
}

export const getPathByType = (type: keyof typeof Types) => (type === 'js' ? 'dist' : 'src');

export const getTypeByEnv = (env: string): keyof typeof Types => (env === 'local' ? 'ts' : 'js');

export const setAliases = () => {
  const path = getPathByType(getTypeByEnv(`${process.env.NODE_ENV}`));
  const root = `${__dirname}/../../`;

  moduleAlias.addAliases({
    '@tests': `${root}${path}/__tests__`,
    '@config': `${root}${path}/config`,
    '@helpers': `${root}${path}/common/helpers`,
    '@middlewares': `${root}${path}/common/middlewares`,
    '@services': `${root}${path}/common/services`,
    '@adapters': `${root}${path}/common/adapters`,
    '@typeDefs': `${root}${path}/common/typeDefs`,
    '@modules': `${root}${path}/modules`
  });
};

export default setAliases();
