require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const app = express();
const normRoute = require('./routes/generalRoutes.js');
const reqRoute = require('./routes/Others/reqRoutes.js');
const pRoute = require('./routes/Planning/planroute.js');
const authCheck = require('./middleware/authCheck');
const flash = require('connect-flash');
const pool = require('./database');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: false,
        cookie: {
        maxAge: 60 * 60 * 1000
    }
}));

app.use('/E-mts', normRoute);
app.use('/E-mts/board',authCheck, reqRoute);
app.use('/E-mts/planning',authCheck, pRoute);

app.get('/', (req, res) => {
    res.redirect('/E-mts');
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});