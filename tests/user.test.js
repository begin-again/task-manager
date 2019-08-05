/* eslint-env jest */
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneID, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

describe('New Users', () => {
  it('should fail to add if password contains password', async () => {
    const badPassword = 'abc123password!!!';
    await request(app)
      .post('/users')
      .send({
        name: 'bob dylan',
        email: 'bdylan@example.com',
        password: badPassword
      })
      .expect(400);
  });
  it('should fail to add if password too short', async () => {
    const badPassword = '123';
    await request(app)
      .post('/users')
      .send({
        name: 'bob dylan',
        email: 'bdylan@example.com',
        password: badPassword
      })
      .expect(400);
  });
  it('should sign up a new user ', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'bob dylan',
        email: 'bdylan@example.com',
        password: userOne.password
      })
      .expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    expect(response.body).toMatchObject({
      user: {
        name: 'bob dylan',
        email: 'bdylan@example.com'
      },
      token: user.tokens[0].token
    });

    expect(user.password).not.toBe(userOne.password);
  });
});

describe('Login', () => {
  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: userOne.email,
        password: userOne.password
      })
      .expect(200);

    const token = response.body.token;
    const foundUser = await User.findById(userOneID);
    // because same user already exists with a token (see fixtures/db), to verify
    // we check for a second token
    expect(token).toBe(foundUser.tokens[1].token);
  });
  it('should not login non-existent user', async () => {
    await request(app)
      .post('/users/login')
      .send({
        email: 'unknown@example.com',
        password: userOne.password
      })
      .expect(400);
  });
});

describe('authenticated', () => {
  describe('Get Profile', () => {
    it('should get profile for user', async () => {
      await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
      const userBefore = await User.findById(userOneID);
      expect(userBefore).not.toBeNull();

      await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

      const userAfter = await User.findById(userOneID);
      expect(userAfter).toBeNull();
    });
    it('should not remove non-auth user', async () => {
      await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
    });
  });
  describe('avatar', () => {
    it('should upload image', async () => {
      await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

      const user = await User.findById(userOneID);
      expect(user.avatar).toEqual(expect.any(Buffer));
    });
  });
  describe('User Updates', () => {
    it('should update valid user fields', async () => {
      const resp = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
          name: 'Pauly Shore'
        })
        .expect(202);

      expect(resp.body.name).toBe('Pauly Shore');
      const foundUser = await User.findById(userOneID);
      expect(foundUser.name).toBe(resp.body.name);
    });
    it('should not update invalid fields', async () => {
      const resp = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
          location: 'should fail'
        })
        .expect(400);

      expect(resp.body.error).toBe('Invalid Operation');
    });
  });
});
