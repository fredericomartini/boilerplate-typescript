describe('Should export route to see application info', () => {
  test('When /status', async () => {
    await global.request
      .get('/status')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  describe('Should return valid response body', () => {
    test('{up: true}', async () => {
      const response = await global.request
        .get('/status')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({ up: true });
    });
  });
});

describe('All requests Not Found', () => {
  test('Should return 404', async () => {
    const data = await global.request
      .get('/route-not-found')
      .expect(404);

    expect(data.body).toMatchObject({});
  });
});

describe('API Documentation', () => {
  describe('Should redirect root route', () => {
    test('/ to /docs', async () => {
      await global.request
        .get('/')
        .expect(302)
        .expect('Location', '/docs');
    });

    test('Should /docs to be valid', async () => {
      await global.request
        .get('/docs/')
        .expect(200);
    });
  });
});

describe('/v1', () => {
  test('Should be defined', async () => {
    const validStatus = [200, 401];

    const response = await global.request
      .get('/v1');

    expect(response.status).toBeOneOf(validStatus);
  });
});
