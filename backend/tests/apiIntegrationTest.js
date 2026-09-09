const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

async function runIntegrationTests() {
  console.log('🚀 Running Backend REST API Integration Tests...\n');
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failures++;
    } else {
      console.log(`✓ PASSED: ${message}`);
    }
  }

  try {
    // 1. Initial pool setup
    await db.initPostgresPool();

    // 2. Health check
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 3. Register user
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Integration Tester',
      email: `integration_${Date.now()}@example.com`,
      password: 'password123',
    });
    assert(regRes.status === 201 && Boolean(regRes.body.token), 'POST /api/auth/register creates user and returns token');
    const token = regRes.body.token;

    // 4. GET /api/tasks without token rejects with 401
    const getUnauthRes = await request(app).get('/api/tasks');
    assert(getUnauthRes.status === 401, 'GET /api/tasks without token correctly rejects with 401');

    // 5. GET /api/tasks with token returns 200 array
    const getTasksRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    assert(getTasksRes.status === 200 && Array.isArray(getTasksRes.body.data), 'GET /api/tasks returns 200 array');

    // 6. GET /api/tasks/stats
    const getStatsRes = await request(app)
      .get('/api/tasks/stats')
      .set('Authorization', `Bearer ${token}`);
    assert(
      getStatsRes.status === 200 &&
      typeof getStatsRes.body.data.total === 'number',
      'GET /api/tasks/stats returns 200 with dynamic metrics'
    );

    // 7. POST /api/tasks - Create valid task
    const postRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Build CI/CD pipeline', description: 'GitHub Actions workflow with test matrix' });
    assert(postRes.status === 201 && postRes.body.data.title === 'Build CI/CD pipeline', 'POST /api/tasks creates task with 201');
    const createdId = postRes.body.data.id;

    // 8. POST /api/tasks - Validation: missing title
    const postEmptyTitleRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title provided' });
    assert(postEmptyTitleRes.status === 400, 'POST /api/tasks rejects missing title with 400');

    // 9. GET /api/tasks/:id - Single task
    const getSingleRes = await request(app)
      .get(`/api/tasks/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    assert(getSingleRes.status === 200 && getSingleRes.body.data.id === createdId, 'GET /api/tasks/:id retrieves task');

    // 10. PUT /api/tasks/:id - Full update
    const putRes = await request(app)
      .put(`/api/tasks/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Build CI/CD pipeline (Updated)', description: 'Updated description', status: 'Completed' });
    assert(
      putRes.status === 200 &&
      putRes.body.data.title === 'Build CI/CD pipeline (Updated)' &&
      putRes.body.data.status === 'Completed',
      'PUT /api/tasks/:id updates task with 200'
    );

    // 11. PATCH /api/tasks/:id/status - Status toggle to Pending
    const patchRes = await request(app)
      .patch(`/api/tasks/${createdId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Pending' });
    assert(patchRes.status === 200 && patchRes.body.data.status === 'Pending', 'PATCH /api/tasks/:id/status toggles status to Pending');

    // 12. DELETE /api/tasks/:id - Delete task
    const deleteRes = await request(app)
      .delete(`/api/tasks/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    assert(deleteRes.status === 200 && deleteRes.body.data.id === createdId, 'DELETE /api/tasks/:id deletes task with 200');

    if (failures === 0) {
      console.log('\n🎉 ALL 12 BACKEND INTEGRATION TESTS PASSED!');
      process.exit(0);
    } else {
      console.error(`\n💥 ${failures} tests failed.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution exception:', err);
    process.exit(1);
  }
}

runIntegrationTests();
