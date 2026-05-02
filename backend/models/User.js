const { sql, poolPromise } = require('../config/db');

class User {
    static async findByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');
        return result.recordset[0];
    }

    static async create(username, email, password) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('INSERT INTO users (username, email, password) VALUES (@username, @email, @password); SELECT SCOPE_IDENTITY() as id');
        return result.recordset[0].id;
    }
}

module.exports = User;
