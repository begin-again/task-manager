/* eslint-env jest */
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../src/models/user');

const fakeUser = {
  name: 'fake user',
  email: 'fake@example.com'
};

const fakeID = new mongoose.Types.ObjectId();

describe('New Users', () => {
  beforeAll(async () => {
    await User.deleteMany();
  });
  it('should fail to add if password contains password', async () => {
    fakeUser.password = 'abc123password!!!';
    await request(app)
      .post('/users')
      .send(fakeUser)
      .expect(400);
  });
  it('should fail to add if password too short', async () => {
    fakeUser.password = '123';
    await request(app)
      .post('/users')
      .send(fakeUser)
      .expect(400);
  });
  it('should sign up a new user ', async () => {
    fakeUser.password = '123secret!!';
    await request(app)
      .post('/users')
      .send(fakeUser)
      .expect(201);
  });
});

describe('Login', () => {
  beforeAll(async () => {
    await User.deleteMany();
    await new User(fakeUser).save();
  });
  it('should login an existing user', async () => {
    fakeUser.password = '123secret!!';
    await request(app)
      .post('/users/login')
      .send({
        email: fakeUser.email,
        password: fakeUser.password
      })
      .expect(200);
  });
  it('should not login non-existent user', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: 'unknown@example.com',
        password: fakeUser.password
      })
      .expect(400);
  });
});
