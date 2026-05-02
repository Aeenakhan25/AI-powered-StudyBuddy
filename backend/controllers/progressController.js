const { sql, poolPromise } = require('../config/db');

exports.getProgress = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query('SELECT TOP 7 * FROM progress WHERE user_id = @userId ORDER BY date DESC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProgress = async (req, res) => {
    const { study_hours, tasks_completed, quizzes_taken } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        const pool = await poolPromise;
        const existing = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('today', sql.Date, today)
            .query('SELECT id FROM progress WHERE user_id = @userId AND date = @today');
        
        if (existing.recordset.length > 0) {
            await pool.request()
                .input('hours', sql.Decimal(4, 2), study_hours || 0)
                .input('tasks', sql.Int, tasks_completed || 0)
                .input('id', sql.Int, existing.recordset[0].id)
                .query('UPDATE progress SET study_hours = study_hours + @hours, tasks_completed = tasks_completed + @tasks WHERE id = @id');
        } else {
            await pool.request()
                .input('userId', sql.Int, req.user.id)
                .input('today', sql.Date, today)
                .input('hours', sql.Decimal(4, 2), study_hours || 0)
                .input('tasks', sql.Int, tasks_completed || 0)
                .query('INSERT INTO progress (user_id, date, study_hours, tasks_completed) VALUES (@userId, @today, @hours, @tasks)');
        }
        res.json({ message: 'Progress updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
