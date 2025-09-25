const express = require('express')
const router = express.Router()
const productController = require('./controllers/productController')
const cartController = require('./controllers/cartController')

router.get('/', productController.home)
router.get('/shop', productController.viewShop)
router.get('/product/:id', productController.viewProduct)

router.get('/cart', cartController.viewCart)
router.post('/cart/add', cartController.addToCart)
router.post('/cart/remove/:id', cartController.removeFromCart)
router.post('/order/create', cartController.createOrder)
router.get('/history', cartController.viewHistory)

module.exports = router