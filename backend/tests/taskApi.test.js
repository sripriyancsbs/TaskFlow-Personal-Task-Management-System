const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('TaskFlow REST API Test Suite', () => {
  let createdTaskId;
  let authToken;

  beforeAll(async () => {
    await db.initPostgresPool();
    // Register test user for authenticated task access
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Task Tester',
      email: `tester_${Date.now()}@example.com`,
      password: 'password123',
    });
    authToken = regRes.body.token;
  });

  test('GET /api/health returns 200 and database health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
    expect(res.body.database.connected).toBe(true);
  });

  test('GET /api/tasks returns 200 and task list with auth', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/tasks/stats returns 200 and dynamic metrics', async () => {
    const res = await request(app)
      .get('/api/tasks/stats')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.total).toBe('number');
    expect(typeof res.body.data.pending).toBe('number');
    expect(typeof res.body.data.completed).toBe('number');
  });

  test('POST /api/tasks creates a task with 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Complete trainee project review',
        description: 'Ensure all 33 requirements are met',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Complete trainee project review');
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.id).toBeDefined();
    createdTaskId = res.body.data.id;
  });

  test('POST /api/tasks rejects missing title with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('title is required');
  });

  test('POST /api/tasks rejects whitespace-only title with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('cannot be empty');
  });

  test('POST /api/tasks rejects invalid status with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Invalid status task', status: 'UnknownStatus' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid status');
  });

  test('GET /api/tasks/:id retrieves single task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  test('GET /api/tasks/:id rejects non-numeric ID with 400', async () => {
    const res = await request(app)
      .get('/api/tasks/invalid-id')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(400);
  });

  test('GET /api/tasks/:id returns 404 for missing task', async () => {
    const res = await request(app)
      .get('/api/tasks/999999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  test('PUT /api/tasks/:id updates task details', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Complete trainee project review (Approved)',
        description: 'Reviewed and verified',
        status: 'Completed',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Complete trainee project review (Approved)');
    expect(res.body.data.status).toBe('Completed');
  });

  test('PATCH /api/tasks/:id/status toggles status to Pending', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Pending' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Pending');
  });

  test('PATCH /api/tasks/:id/status toggles status back to Completed', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Completed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Completed');
  });

  test('DELETE /api/tasks/:id deletes task with 200', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  test('DELETE /api/tasks/:id returns 404 for already deleted task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
