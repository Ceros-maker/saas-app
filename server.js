require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const db = require('./db');
const router = express.Router();

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.use((req, res, next) => {
    if (req.session.userId) {
        const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.session.userId);
        res.locals.user = user;
    } else {
        res.locals.user = null;
    }
    next();
});

const authRoutes = require('./routes/auth');
const policyRoutes = require('./routes/policies');
const customerRoutes = require('./routes/customers');

app.use('/', authRoutes);
app.use('/', policyRoutes);
app.use('/', customerRoutes);

app.get('/', (req, res) => {
    res.send('blog is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});