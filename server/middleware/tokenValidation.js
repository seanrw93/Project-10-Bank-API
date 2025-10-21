const jwt = require('jsonwebtoken');
const { restart } = require('nodemon');

module.exports.validateToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^\s*Bearer\s+(.+)$/i);
    if (!m) return res.status(401).send({ status: 401, message: 'Authorization header missing or malformed' });

    const token = m[1];
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).send({ status: 500, message: 'Server misconfigured (missing SECRET_KEY)' });

    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).send({ status: 401, message: 'Invalid or expired token' });
  }
};