const { sql, poolPromise } = require('../config/db');

exports.getSummary = async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Parallel queries using T-SQL
        const notesCount = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT COUNT(*) as count FROM notes WHERE user_id = @uid');
        const tasksCount = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT COUNT(*) as count FROM study_plans WHERE user_id = @uid AND status = \'completed\'');
        const quizAvg = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT AVG(score) as avgScore FROM quizzes WHERE user_id = @uid');
        
        const recentNotes = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT TOP 3 title as activity, \'note\' as type, created_at FROM notes WHERE user_id = @uid ORDER BY created_at DESC');
        const recentChats = await pool.request().input('uid', sql.Int, req.user.id).query('SELECT TOP 3 message as activity, \'chat\' as type, created_at FROM chats WHERE user_id = @uid ORDER BY created_at DESC');
        
        const recentActivity = [...recentNotes.recordset, ...recentChats.recordset]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        res.json({
            totalNotes: notesCount.recordset[0].count,
            completedTasks: tasksCount.recordset[0].count,
            avgQuizScore: Math.round(quizAvg.recordset[0].avgScore || 0),
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
