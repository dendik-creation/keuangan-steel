const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'query',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


pool.getConnection()
.then(conn => {
    console.log('Database connected');
    conn.release();
})
.catch(err => {
    console.log('Database error:', err);
});


exports.query = async (sql, values = []) => {
    try {

        const koneksi = await pool.getConnection();

        const hasil = await koneksi.query(sql, values);

        koneksi.release();

        return hasil;

    } catch(error){

        console.log(error);
        throw error;

    }
};