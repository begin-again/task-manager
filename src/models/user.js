const mongoose = require('mongoose');
const validator = require('validator');
const { hash, compare } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const options = {
  toJSON: { virtuals: true },
  timestamps: true
};
const schema = {
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate (value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate (value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate (value) {
      if (value < 0) {
        throw new Error('Age must be a postive number');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
};
const userSchema = new mongoose.Schema(schema, options);

// virtual property

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

// instance methods
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.APP_JWT_SECRET);
  user.tokens.push({ token });
  await user.save();
  return token;
};

// Schema-level methods
userSchema.statics.findByCredentials = async (email, pwd) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Unable to login');
  const isMatch = await compare(pwd, user.password);
  if (!isMatch) throw new Error('Unable to login');
  return user;
};

// hash plaintext before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await hash(user.password, 8);
  }
  next();
});

// delete user tasks when use is deleted
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
