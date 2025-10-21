require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.DBMONGO_URI;
if (!MONGO_URI) {
  throw new Error('Missing DBMONGO_URI in .env');
}

// global cache across module reloads (important for serverless/cold-start reuse)
let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // tune timeouts so failures surface quickly instead of hanging forever
  serverSelectionTimeoutMS: 5000, // try for 5s then error
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // optional: limit pool size if you want
  // maxPoolSize: 5
};

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, options).then(m => {
      return m.connection;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect, mongoose };