require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DBMONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Database Connectivity Error:", err));
module.exports = mongoose;