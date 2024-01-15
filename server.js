require('dotenv').config({ path: '.env' });
const express = require('express');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const pool = require('./db.js');

const app = express();

let appServer = app.listen(process.env.PORT, '0.0.0.0', () => {
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

app.post('/login', async (req, res) => {
    try {
        if (req.session.id_user) {
            console.log("user session already stored :)")
            return res.send("user session already stored :)")
        }
        else {
            console.log("in else")
            console.log(req.body.user)
            await genererSession(req, req.body.user)
            res.status(200).send("user wasn't logged in, but now he is :)")

        }

    } catch (error) {
        console.error(`/login : ${error}`)
        res.json({ error: 'error during login' })
    }
});

async function genererSession(req, user) {
    return new Promise((resolve, reject) => { // marche pas sans promise !!!
        req.session.regenerate(function (err) {
            if (err) reject(err)
            req.session.id_user = user + Date.now()
            req.session.save(function (err) {
                if (err) reject(err)
                else resolve(true)
            })
        })
    })
}