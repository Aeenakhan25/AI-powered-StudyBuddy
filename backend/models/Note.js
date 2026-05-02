const { sql, poolPromise } = require('../config/db');

class Note {
    static async findAllByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM notes WHERE user_id = @userId ORDER BY created_at DESC');
        return result.recordset;
    }

    static async findById(id, userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM notes WHERE id = @id AND user_id = @userId');
        return result.recordset[0];
    }

    static async create(userId, title, content, folder) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('title', sql.NVarChar, title)
            .input('content', sql.NVarChar, content)
            .input('folder', sql.NVarChar, folder)
            .query('INSERT INTO notes (user_id, title, content, folder) VALUES (@userId, @title, @content, @folder); SELECT SCOPE_IDENTITY() as id');
        return result.recordset[0].id;
    }

    static async update(id, userId, title, content, folder) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .input('title', sql.NVarChar, title)
            .input('content', sql.NVarChar, content)
            .input('folder', sql.NVarChar, folder)
            .query('UPDATE notes SET title = @title, content = @content, folder = @folder, updated_at = GETDATE() WHERE id = @id AND user_id = @userId');
    }

    static async delete(id, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM notes WHERE id = @id AND user_id = @userId');
    }
}

module.exports = Note;
