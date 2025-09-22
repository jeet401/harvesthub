const jwt = require('jsonwebtoken');

const authRequired = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me_in_prod');
    req.user = payload; // This will include sub, role, email
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminRequired = (req, res, next) => {
  authRequired(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  });
};

const farmerRequired = (req, res, next) => {
  authRequired(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Farmer privileges required' });
    }
    
    next();
  });
};

const buyerRequired = (req, res, next) => {
  authRequired(req, res, (err) => {
    if (err) return next(err);
    
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Buyer privileges required' });
    }
    
    next();
  });
};

module.exports = {
  authRequired,
  adminRequired,
  farmerRequired,
  buyerRequired
};
