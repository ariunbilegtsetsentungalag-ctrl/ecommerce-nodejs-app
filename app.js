require('dotenv').config();
const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')

// Import controllers
const authController = require('./controllers/authController')
const productController = require('./controllers/productController')
const cartController = require('./controllers/cartController')
const { isAuthenticated } = require('./middleware/auth')

// Connect to MongoDB Atlas
const dbURI = process.env.CONNECTION_STRING;
mongoose.connect(dbURI, {
  dbName: 'App'  // Set the database name here
})
  .then(() => console.log('Connected to MongoDB Atlas...'))
  .catch(err => console.error('Could not connect to MongoDB:', err))

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

// Enhanced session configuration with security
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: dbURI,
    dbName: 'App',
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'strict'
  }
}))

app.use(flash())


app.use((req, res, next) => {

  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  res.locals.user = req.session.user;
  

  res.locals.success = req.flash('success') || [];
  res.locals.error = req.flash('error') || [];
  next();
});


app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.get('/signup', authController.getSignup);
app.post('/signup', authController.postSignup);
app.get('/logout', authController.logout);


app.get('/', isAuthenticated, (req, res) => res.redirect('/shop'));
app.get('/shop', isAuthenticated, productController.viewProducts);
app.get('/cart', isAuthenticated, cartController.viewCart);
app.post('/cart/add', isAuthenticated, cartController.addToCart);
app.get('/cart/remove/:id', isAuthenticated, cartController.removeFromCart);
app.post('/cart/checkout', isAuthenticated, cartController.checkout);
app.get('/order-history', isAuthenticated, cartController.orderHistory);
app.get('/cart/remove/:id', isAuthenticated, cartController.removeFromCart);
app.post('/cart/checkout', isAuthenticated, cartController.checkout);
app.get('/order-history', isAuthenticated, cartController.orderHistory);
app.get('/cart/remove/:id', isAuthenticated, cartController.removeFromCart);
app.post('/cart/checkout', isAuthenticated, cartController.checkout);
app.get('/order-history', isAuthenticated, cartController.orderHistory);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('404', { 
    title: 'Error',
    message: 'Something went wrong!' 
  });
});


app.use((req, res) => {
  res.status(404).render('404', { 
    title: '404 Not Found',
    message: 'Page not found'
  });
});

const PORT = process.env.PORT || 9005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;