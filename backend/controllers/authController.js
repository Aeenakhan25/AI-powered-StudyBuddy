const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create(username, email, hashedPassword);

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'studyai_secret_key');
        res.status(201).json({ token, user: { id: userId, username, email } });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'studyai_secret_key');
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
};
