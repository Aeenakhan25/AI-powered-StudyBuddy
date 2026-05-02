const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');

dotenv.config();

const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const database = process.env.DB_NAME || 'ai_study_assistant';

const config = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=yes;`,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server (SSMS) using Windows Authentication');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};
