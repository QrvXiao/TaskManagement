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
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'username and password required' });
    }
    
    console.log('Checking existing user...');
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('Username already taken:', username);
      return res.status(409).json({ error: 'username taken' });
    }
    
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Creating user...');
    const u = new User({ username, passwordHash });
    await u.save();
    
    console.log('User created successfully:', u.username);
    res.status(201).json({ username: u.username, id: u._id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'register failed' });
  }
});

module.exports = router;