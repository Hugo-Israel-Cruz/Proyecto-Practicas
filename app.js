const express = require('express');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    res.render('inicio');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.get('/inicio', (req, res) => {
    res.render('inicio');
});

app.get('/tramite', (req, res) => {
    res.render('tramite');
});

app.get('/seguimiento', (req, res) => {
    res.render('seguimiento');
});

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});