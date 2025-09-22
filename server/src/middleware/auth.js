const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken, setAuthCookies } = require('../utils/jwt');
const { authRequired } = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Validate role
    const validRoles = ['buyer', 'farmer', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be buyer, farmer, or admin' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || 'buyer'; // Default to buyer if no role specified
    
    const user = await User.create({ 
      email, 
      passwordHash, 
      role: userRole 
    });

    // Create profile for all user types (admin profiles might have different fields later)
    await Profile.create({ userId: user._id });

    const accessToken = signAccessToken({ 
      sub: user._id.toString(), 
      role: user.role,
      email: user.email 
    });
    const refreshToken = signRefreshToken({ 
      sub: user._id.toString(),
      role: user.role 
    });

    setAuthCookies(res, { accessToken, refreshToken });

    return res.status(201).json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account created successfully`
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Optional: Verify role if specified in login request
    if (role && user.role !== role) {
      return res.status(401).json({ 
        message: `This account is not registered as ${role}. Please use the correct login type.` 
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const accessToken = signAccessToken({ 
      sub: user._id.toString(), 
      role: user.role,
      email: user.email 
    });
    const refreshToken = signRefreshToken({ 
      sub: user._id.toString(),
      role: user.role 
    });

    setAuthCookies(res, { accessToken, refreshToken });

    return res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      message: `Welcome back, ${user.role}!`
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'change_me_too');
    
    // Verify user still exists and is active
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    const accessToken = signAccessToken({ 
      sub: payload.sub, 
      role: user.role,
      email: user.email 
    });
    
    setAuthCookies(res, { accessToken, refreshToken: token });
    
    return res.json({ ok: true, role: user.role });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
  return res.json({ ok: true, message: 'Logged out successfully' });
});

router.post('/complete-profile', authRequired, async (req, res) => {
  try {
    const { name, phone, address } = req.body || {};
    
    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Name, phone, and address are required' });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.sub },
      { name, phone, address },
      { new: true, upsert: true }
    );

    return res.json({ 
      profile,
      message: 'Profile completed successfully' 
    });
  } catch (err) {
    console.error('Profile completion error:', err);
    return res.status(500).json({ message: 'Profile update failed' });
  }
});

// Admin-specific routes
router.get('/users', authRequired, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (role && ['buyer', 'farmer', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash') // Exclude password hash
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
