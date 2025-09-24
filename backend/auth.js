const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./model/user.model');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'username taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const u = new User({ username, passwordHash });
    await u.save();
    res.status(201).json({ username: u.username, id: u._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'register failed' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username });
    if (!u) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: u._id, username: u.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: u._id, username: u.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'login failed' });
  }
});

module.exports = router;