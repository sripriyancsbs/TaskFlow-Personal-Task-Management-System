const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

beforeAll(async () => {
  await db.initPostgresPool();
});

describe('Authentication & User Isolation Test Suite', () => {
  let userAToken;
  let userBToken;
  let userATaskId;
  let userBTaskId;

  const userAData = {
    name: 'User Alpha',
    email: `alpha_${Date.now()}@example.com`,
    password: 'password123',
  };

  const userBData = {
    name: 'User Beta',
    email: `beta_${Date.now()}@example.com`,
    password: 'password456',
  };

  test('POST /api/auth/register creates user A and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(userAData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(userAData.email.toLowerCase());
    userAToken = res.body.token;
  });

  test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send(userAData);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login logs in user A with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login rejects incorrect password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userAData.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/tasks rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Authentication required');
  });

  test('User A creates a private task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: "Alpha's Confidential Task",
        description: 'Only visible to User Alpha',
        priority: 'High',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Alpha's Confidential Task");
    userATaskId = res.body.data.id;
  });

  test('User B registers and receives token', async () => {
    const res = await request(app).post('/api/auth/register').send(userBData);
    expect(res.status).toBe(201);
    userBToken = res.body.token;
  });

  test('User B task list is isolated (does NOT see User A tasks)', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    const foundTaskA = res.body.data.some((t) => t.id === userATaskId);
    expect(foundTaskA).toBe(false);
  });

  test('User B creates a separate task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        title: "Beta's Private Roadmap",
        description: 'Only visible to User Beta',
        priority: 'Medium',
      });
    expect(res.status).toBe(201);
    userBTaskId = res.body.data.id;
  });

  test('User B cannot edit User A task (Isolation enforcement)', async () => {
    const res = await request(app)
      .put(`/api/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked by Beta', status: 'Pending' });
    expect(res.status).toBe(404);
  });

  test('User B cannot delete User A task (Isolation enforcement)', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(404);
  });

  test('User A still sees their own task unmodified', async () => {
    const res = await request(app)
      .get(`/api/tasks/${userATaskId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Alpha's Confidential Task");
  });
});
