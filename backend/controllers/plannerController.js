const { sql, poolPromise } = require('../config/db');

exports.getPlans = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query('SELECT * FROM study_plans WHERE user_id = @userId ORDER BY deadline ASC');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPlan = async (req, res) => {
    const { title, subject, description, deadline } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('title', sql.NVarChar, title)
            .input('subject', sql.NVarChar, subject)
            .input('desc', sql.NVarChar, description)
            .input('deadline', sql.Date, deadline)
            .query('INSERT INTO study_plans (user_id, title, subject, description, deadline) VALUES (@userId, @title, @subject, @desc, @deadline); SELECT SCOPE_IDENTITY() as id');
        res.status(201).json({ id: result.recordset[0].id, title, subject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePlanStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('userId', sql.Int, req.user.id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE study_plans SET status = @status WHERE id = @id AND user_id = @userId');
        res.json({ message: 'Updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('userId', sql.Int, req.user.id)
            .query('DELETE FROM study_plans WHERE id = @id AND user_id = @userId');
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
