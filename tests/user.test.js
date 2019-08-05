/* eslint-env jest */
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const goose = require('mongoose');
const User = require('../src/models/user');
const SECRET = process.env.APP_JWT_SECRET;

describe('New Users', () => {
  const fakeUser = {
    name: 'fake user',
    email: 'fake@example.com'
  };
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
  const fakeUser = {
    name: 'fake user',
    email: 'fake@example.com'
  };
  beforeAll(async () => {
    await User.deleteMany();
  });
  it('should login an existing user', async () => {
    fakeUser.password = '123secret!!';
    await new User(fakeUser).save();
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

describe('authenticated', () => {
  const fakeID = new goose.Types.ObjectId();
  console.log(fakeID, SECRET);
  const fakeUser = {
    _id: fakeID,
    name: 'fake user',
    email: 'fake@example.com',
    password: '123secret!!',
    tokens: [{
      token: jwt.sign({ _id: fakeID }, SECRET)
    }]
  };
  beforeAll(async () => {
    await User.deleteMany();
    await new User(fakeUser).save();
  });
  describe('Get Profile', () => {
    it('should get profile for user', async () => {
      await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${fakeUser.tokens[0].token}`)
        .send()
        .expect(200);
    });
    it('should not get profile of non-auth user', async () => {
      await request(app)
        .get('/users/me')
        .send()
        .expect(401);
    });
    it('should not get profile for bogus bearer token', async () => {
      await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer fake_token`)
        .send()
        .expect(401);
    });
  });
  describe('Delete user', () => {
    it('should remove auth user', async () => {
      await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${fakeUser.tokens[0].token}`)
        .send()
        .expect(200);
    });
    it('should not remove non-auth user', async () => {
      await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
    });
  });
});
