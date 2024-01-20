const jwt = require('jsonwebtoken');

const authenticate = async(req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.HOSPITAL_ID = decodedToken.HOSPITAL_ID;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
module.exports = authenticate; 