require('dotenv').config({ path: '.env' });
const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const pgCon = require('pg')

const pool = new pgCon.Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
})

const app = express();

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server listening on the port::${process.env.PORT}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = new pgSession({
    pool: pool,
    tableName: 'session'
})

app.use(expressSession({
    store: store, // comment to use the in-memory store
    secret: process.env.COOKIE,
    resave: true,
    saveUninitialized: false,
    unset: 'destroy',
    secure: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/login', (req, res) => {
    try {
        if (req.session.username) {
            console.log("user session already stored :)")
            return res.status(200).send({ success: "user session was already stored :)" })
        }
        else if (req.body.username) {
            req.session.username = req.body.username + Date.now()
            console.log("user session now stored :)")
            return res.status(200).send({ success: "a new session was created" })
        }
        else {
            console.log("user session not stored or empty")
            return res.status(200).send({ error: "user session not stored or empty" })
        }
    } catch (error) {
        console.error(`/login : ${error}`)
        res.json({ error: 'error during login' })
    }
});

app.get('/session_table', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM session')
        res.json(result.rows)
    } catch (error) {
        console.error(`/session_table : ${error}`)
        res.json({ error: 'error retrieving session table' })
    }
});