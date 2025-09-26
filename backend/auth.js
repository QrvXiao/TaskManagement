const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./model/user.model');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// register
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

// login - 修正：这应该是 login 路由，不是第二个 register
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Missing login credentials');
      return res.status(400).json({ error: 'username and password required' });
    }
    
    console.log('Finding user...');
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'invalid credentials' });
    }
    
    console.log('Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'invalid credentials' });
    }
    
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { sub: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    console.log('Login successful for user:', username);
    res.json({ 
      token, 
      user: { id: user._id, username: user.username } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'login failed' });
  }
});

module.exports = router;