const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.DBMONGO_URI;
if (!uri) {
  throw new Error('Missing DBMONGO_URI in environment');
}

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let db;

async function connect() {
  if (db) return db; 
  client = new MongoClient(uri, options);
  await client.connect();
  db = client.db(); 
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

function getCollection(name) {
  return getDb().collection(name);
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connect, getDb, getCollection, close };