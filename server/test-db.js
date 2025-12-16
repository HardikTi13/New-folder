const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

console.log("Connecting to:", process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in log

client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.end();
    })
    .catch(err => {
        console.error('Connection failed!', err);
        process.exit(1);
    });
