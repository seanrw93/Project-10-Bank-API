const { getCollection } = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const USERS_COLL = 'users';

module.exports.createUser = async (body) => {
  try {
    const col = getCollection(USERS_COLL);

    const existing = await col.findOne({ email: body.email });
    if (existing) {
      const e = new Error('Email already exists');
      e.status = 400;
      throw e;
    }

    const hashPassword = await bcrypt.hash(body.password, 12);
    const doc = {
      email: body.email,
      password: hashPassword,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      createdAt: new Date(),
    };

    const { insertedId } = await col.insertOne(doc);
    return { id: insertedId.toString(), email: doc.email, firstName: doc.firstName, lastName: doc.lastName };
  } catch (err) {
    console.error('Error in userService.createUser', err);
    throw err;
  }
};

module.exports.loginUser = async (body) => {
  try {
    const col = getCollection(USERS_COLL);
    const user = await col.findOne({ email: body.email });
    if (!user) {
      const e = new Error('User not found');
      e.status = 404;
      throw e;
    }

    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) {
      const e = new Error('Password is invalid');
      e.status = 401;
      throw e;
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '1d' });
    return { token };
  } catch (err) {
    console.error('Error in userService.loginUser', err);
    throw err;
  }
};

module.exports.getUserProfile = async (req) => {
  try {
    const userId = req.userId;
    if (!userId) {
      const e = new Error('Unauthorized');
      e.status = 401;
      throw e;
    }

    const col = getCollection(USERS_COLL);
    const user = await col.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );
    if (!user) {
      const e = new Error('User not found');
      e.status = 404;
      throw e;
    }
    // normalize id field if needed
    user.id = user._id;
    delete user._id;
    return user;
  } catch (err) {
    console.error('Error in userService.getUserProfile', err);
    throw err;
  }
};

module.exports.updateUserProfile = async (req) => {
  try {
    const userId = req.userId;
    if (!userId) {
      const e = new Error('Unauthorized');
      e.status = 401;
      throw e;
    }

    const { firstName, lastName } = req.body || {};
    const set = {};
    if (typeof firstName === 'string' && firstName.trim()) set.firstName = firstName.trim();
    if (typeof lastName === 'string' && lastName.trim()) set.lastName = lastName.trim();

    if (Object.keys(set).length === 0) {
      const e = new Error('No fields to update');
      e.status = 400;
      throw e;
    }

    const col = getCollection(USERS_COLL);
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: set },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    const updated = result.value;
    if (!updated) {
      const e = new Error('User not found');
      e.status = 404;
      throw e;
    }
    updated.id = updated._id;
    delete updated._id;
    return updated;
  } catch (err) {
    console.error('Error in userService.updateUserProfile', err);
    throw err;
  }
};