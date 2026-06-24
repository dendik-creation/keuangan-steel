const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

const routes = require('./routes');
// pages routes (EJS templates)
const pagesRoutes = require('./routes/pages');

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management - Anggota 2
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set true jika menggunakan HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', routes);
app.use('/', pagesRoutes);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Server listening on ${url}`);
  console.log(`Buka di browser: ${url}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set PORT to a different value and restart.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
