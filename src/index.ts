import { SetupServer } from './server';

(async (): Promise<void> => {
  const server = new SetupServer(Number(process.env.PORT));

  await server.init();
  server.listen();
})();
