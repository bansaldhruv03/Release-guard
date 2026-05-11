// Global setup for e2e tests — sets required environment variables
// so the full NestJS app can bootstrap in the test environment.
module.exports = async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-secret-do-not-use-in-production';
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
};
