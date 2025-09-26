require('dotenv').config();
const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const authController = require('./controllers/authController')
const productController = require('./controllers/productController')
const cartController = require('./controllers/cartController')
const adminController = require('./controllers/adminController')
const { isAuthenticated } = require('./middleware/auth')
const { isAdminOrProductManager, isAdmin } = require('./middleware/adminAuth')


const dbURI = process.env.CONNECTION_STRING;
mongoose.connect(dbURI, {
  dbName: 'App'  
})
  .then(() => console.log('Connected to MongoDB Atlas...'))
  .catch(err => console.error('Could not connect to MongoDB:', err))

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: dbURI,
    dbName: 'App',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, 
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
app.get('/product/:id', isAuthenticated, productController.viewProduct);
app.get('/cart', isAuthenticated, cartController.viewCart);
app.post('/cart/add', isAuthenticated, cartController.addToCart);
app.get('/cart/remove/:id', isAuthenticated, cartController.removeFromCart);
app.post('/cart/checkout', isAuthenticated, cartController.checkout);
app.get('/order-history', isAuthenticated, cartController.orderHistory);

// Admin Routes
app.get('/admin', isAuthenticated, isAdminOrProductManager, adminController.dashboard);
app.get('/admin/products', isAuthenticated, isAdminOrProductManager, adminController.getProducts);
app.get('/admin/add-product', isAuthenticated, isAdminOrProductManager, adminController.getAddProduct);
app.post('/admin/products', isAuthenticated, isAdminOrProductManager, adminController.uploadProductImages, adminController.createProduct);
app.get('/admin/products/:id/edit', isAuthenticated, isAdminOrProductManager, adminController.getEditProduct);
app.post('/admin/products/:id', isAuthenticated, isAdminOrProductManager, adminController.uploadProductImages, adminController.updateProduct);
app.post('/admin/products/:id/delete', isAuthenticated, isAdminOrProductManager, adminController.deleteProduct);
app.get('/admin/users', isAuthenticated, isAdmin, adminController.getUsers);
app.post('/admin/users/role', isAuthenticated, isAdmin, adminController.updateUserRole);


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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.70.152:${PORT}`);
});
module.exports = app;