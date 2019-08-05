/* eslint-env jest */
const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userOne, userTwo,
  taskOne,
  setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);

it('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'fake task'
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

it('should obtain tasks for a user', async () => {
  const resp = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      owner: userOne._id
    })
    .expect(200);

  expect(resp.body.length).toBe(2);
});

it('should delete a task for current user', async () => {
  const taskBefore = await Task.findById(taskOne._id);
  expect(taskBefore).not.toBeNull();
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const taskAfter = await Task.findById(taskOne._id);
  expect(taskAfter).toBeNull();
});
it('should fail to delete a task for non-current user', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
