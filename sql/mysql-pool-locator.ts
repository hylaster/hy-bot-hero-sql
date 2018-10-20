import mysql from "mysql";

export default {
    getPool: function (): mysql.Pool {
        return mysql.createPool({
            connectionLimit: 10,
            host: 'us-cdbr-iron-east-05.cleardb.net',
            user: 'b2bd33981e831f',
            password: '5ee7aa57',
            database: 'heroku_73d18bb7c7b731d'
        });
    }
}