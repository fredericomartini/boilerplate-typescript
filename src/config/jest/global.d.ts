declare namespace NodeJS {
  interface Global {
    request: import('supertest').SuperTest<import('supertest').Test>;
  }
}
