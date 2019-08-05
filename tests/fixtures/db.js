const goose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');
const SECRET = process.env.APP_JWT_SECRET;

const userOneID = new goose.Types.ObjectId();
const userOne = {
  _id: userOneID,
  name: 'fake user',
  email: 'fake@example.com',
  password: '123secret!!',
  tokens: [{
    token: jwt.sign({ _id: userOneID }, SECRET)
  }]
};

const userTwoID = new goose.Types.ObjectId();
const userTwo = {
  _id: userTwoID,
  name: 'fake user two',
  email: 'fake2@example.com',
  password: 'abcsimpleas123',
  tokens: [{
    token: jwt.sign({ _id: userTwoID }, SECRET)
  }]
};

const taskOne = {
  _id: new goose.Types.ObjectId(),
  description: 'First Task',
  completed: false,
  owner: userOne._id
};

const taskTwo = {
  _id: new goose.Types.ObjectId(),
  description: 'Second Task',
  completed: true,
  owner: userOne._id
};

const taskThree = {
  _id: new goose.Types.ObjectId(),
  description: 'Third Task',
  completed: true,
  owner: userTwo._id
};

const setupDatabase = async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();

  await Task.deleteMany();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneID,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
};
