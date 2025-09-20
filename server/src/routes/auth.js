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
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: role === 'farmer' ? 'farmer' : 'buyer' });
    await Profile.create({ userId: user._id });
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    setAuthCookies(res, { accessToken, refreshToken });
    return res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString() });
    setAuthCookies(res, { accessToken, refreshToken });
    return res.json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'change_me_too');
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    setAuthCookies(res, { accessToken, refreshToken: token });
    return res.json({ ok: true });
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

module.exports = router;


