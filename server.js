require('dotenv').config({ path: '.env' });
const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const pool = require('./db.js');

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
    store: store,
    secret: process.env.COOKIE,
    resave: true,
    saveUninitialized: false,
    secure: false,
    unset: 'destroy',
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
}));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/am_i_logged_in', function (req, res) {
    if (req.session.username) {
        console.log("user session already stored :)")
        res.status(200).send({ success: "user session already stored :)" })
    }
    else {
        console.log("user session not stored or empty")
        res.status(200).send({ error: "user session not stored or empty" })
    }
});

app.post('/login', async (req, res) => {
    try {
        if (req.session.username) {
            console.log("user session already stored :)")
            return res.send("user session already stored :)")
        }
        else if(req.body.username !== ""){
            console.log("user session '", req.body.username, "' not stored or empty, making a new one")
            await createSession(req)
            res.status(200).send({ success: "user wasn't logged in, but now he is" })
        }
        else{
            console.log("no username was provided, not making a new session")
            res.status(200).send({ error: "no username was provided" })
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

async function createSession(req) {
    req.session.regenerate(function (err) {
        if (err) throw (err)
        req.session.username = req.body.username + Date.now()
        req.session.save(function (err) {
            if (err) throw (err)
        })
    })
}