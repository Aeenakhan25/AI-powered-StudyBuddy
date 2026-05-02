const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Basic Route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Import Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');
const plannerRoutes = require('./routes/planner');
const progressRoutes = require('./routes/progress');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
