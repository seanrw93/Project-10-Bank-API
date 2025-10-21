const userService = require('../services/userService')

// Small helper to keep responses consistent
function send(res, status, message, body) {
  return res.status(status).send({ status, message, body })
}

module.exports.createUser = async (req, res) => {
  try {
    const responseFromService = await userService.createUser(req.body)
    return send(res, 200, 'User successfully created', responseFromService)
  } catch (error) {
    const status = error.statusCode || error.status || 400
    console.error('Error in createUser (userController.js):', error)
    return send(res, status, error.message || 'Failed to create user')
  }
}

module.exports.loginUser = async (req, res) => {
  try {
    const responseFromService = await userService.loginUser(req.body)
    return send(res, 200, 'User successfully logged in', responseFromService)
  } catch (error) {
    // If the service throws an auth error, prefer 401; otherwise default to provided status or 400
    const status = error.statusCode || error.status || (error.name === 'UnauthorizedError' ? 401 : 400)
    console.error('Error in loginUser (userController.js):', error)
    return send(res, status, error.message || 'Failed to login user')
  }
}

module.exports.getUserProfile = async (req, res) => {
  try {
    // tokenValidation middleware should attach req.userId; userService uses it
    const responseFromService = await userService.getUserProfile(req)
    return send(res, 200, 'Successfully got user profile data', responseFromService)
  } catch (error) {
    // Prefer 401/403 for auth issues if provided by service/middleware, otherwise 400
    const status = error.statusCode || error.status || 400
    console.error('Error in getUserProfile (userController.js):', error)
    return send(res, status, error.message || 'Failed to get user profile data')
  }
}

module.exports.updateUserProfile = async (req, res) => {
  try {
    // tokenValidation middleware should attach req.userId; userService uses it
    const responseFromService = await userService.updateUserProfile(req)
    return send(res, 200, 'Successfully updated user profile data', responseFromService)
  } catch (error) {
    const status = error.statusCode || error.status || 400
    console.error('Error in updateUserProfile (userController.js):', error)
    return send(res, status, error.message || 'Failed to update user profile data')
  }
}