const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Cookie options for production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

// JWT utility functions
const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'change_me_in_prod', { expiresIn: '15m' });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'change_me_too', { expiresIn: '7d' });
};

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    
    // Validate role
    const validRoles = ['buyer', 'farmer', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'buyer';
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: userRole });
    // Create profile with email username as default name
    const defaultName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    await Profile.create({ userId: user._id, name: defaultName });
    
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    
    // Set cookies
    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, cookieOptions);
    
    return res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Optional: Verify the role matches if provided
    if (role && user.role !== role) {
      console.log('Role mismatch. Expected:', role, 'Actual:', user.role);
      return res.status(401).json({ message: `This account is not registered as ${role}` });
    }
    
    console.log('Comparing password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log('Password comparison failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Generating tokens...');
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    
    console.log('Setting cookies...');
    // Set cookies
    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, cookieOptions);
    
    console.log('Login successful for user:', user.email);
    return res.json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error details:', err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'change_me_too');
    
    // Get user data to return with the refresh
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    const accessToken = signAccessToken({ sub: payload.sub, role: user.role });
    
    // Set cookies
    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', token, cookieOptions);
    
    return res.json({ 
      ok: true, 
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
  return res.json({ ok: true });
});

router.post('/complete-profile', authRequired, async (req, res) => {
  try {
    const { name, phone, address } = req.body || {};
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.sub },
      { name, phone, address },
      { new: true, upsert: true }
    );
    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Profile update failed' });
  }
});

router.get('/profile', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const profile = await Profile.findOne({ userId: req.user.sub });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create default name if profile doesn't exist or has no name
    const defaultName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
    
    // If profile exists but has no name, provide default
    if (profile && !profile.name) {
      profile.name = defaultName;
    }
    
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      profile: profile || { userId: user._id, name: defaultName, phone: '', address: '' }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Profile fetch failed' });
  }
});

router.put('/profile', authRequired, async (req, res) => {
  try {
    const { name, phone, address } = req.body || {};
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.sub },
      { name, phone, address },
      { new: true, upsert: true }
    );
    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Profile update failed' });
  }
});

module.exports = router;


