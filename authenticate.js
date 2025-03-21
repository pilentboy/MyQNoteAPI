const jwt = require('jsonwebtoken');
const pool = require("./db");

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The secret key used to sign the token.
 * @returns {object} - The decoded payload if the token is valid.
 * @throws {Error} - Throws an error if the token is invalid or expired.
 */
 
 
const authenticate = async (req, res, next) => {
  // Extract the token from the Authorization header
  const accessKey = req.headers['authorization']?.split(' ')[1];
  

  if (!accessKey) {
    return res.status(401).json({ error: 'Access key is required' });
  }
	
  try {
    // Verify the JWT token
    const decoded = jwt.verify(accessKey, process.env.JWT_SECRET);


    //query the database to check if the access key is valid
    const result = await pool.query(
      'SELECT * FROM access_key WHERE key = $1 AND user_id = $2',
      [accessKey, decoded.id] 
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired access key' });
    }

    // Attach the user information to the request object
    req.user = {
      id: decoded.id, // User ID from the token 
      username: decoded.username, // Username from the token 
    };
	
    next();
  } catch (error) {
    console.error('Error validating access key:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
module.exports=authenticate;