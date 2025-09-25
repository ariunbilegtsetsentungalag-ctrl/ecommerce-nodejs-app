const Order = require('../models/Order');

exports.viewCart = (req, res) => {
  const cart = req.session.cart || { items: [] }
  res.render('cart', { cart, title: 'My Cart' })
}

exports.addToCart = (req, res) => {
  const productId = req.body.productId

  const productController = require('./productController')
  const product = productController._products.find(p => p.id === productId)
  if (!product) {
    req.flash('error', 'Product not found')
    return res.redirect('/shop')
  }
  req.session.cart = req.session.cart || { items: [] }
  const existing = req.session.cart.items.find(i => i.product.id === product.id)
  if (existing) existing.quantity += 1
  else req.session.cart.items.push({ product, quantity: 1 })
  req.flash('success', 'Added to cart')
  res.redirect('/shop')
}

exports.removeFromCart = (req, res) => {
  const id = req.params.id
  req.session.cart = req.session.cart || { items: [] }
  req.session.cart.items = req.session.cart.items.filter(i => i.product.id !== id)
  res.redirect('/cart')
}

exports.checkout = async (req, res) => {
  try {
    const cart = req.session.cart || { items: [] }
    if (cart.items.length === 0) {
      req.flash('error', 'Your cart is empty')
      return res.redirect('/cart')
    }

    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0)

    const order = new Order({
      user: req.session.userId,
      products: cart.items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      totalAmount
    })

    await order.save()

    req.session.cart = { items: [] }
    req.flash('success', 'Order placed successfully!')
    res.redirect('/order-history')
  } catch (error) {
    console.error('Error during checkout:', error)
    req.flash('error', 'An error occurred during checkout')
    res.redirect('/cart')
  }
}

exports.orderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({ orderDate: -1 })
    res.render('order-history', { 
      orders,
      title: 'Order History'
    })
  } catch (error) {
    console.error('Error fetching order history:', error)
    req.flash('error', 'Could not fetch order history')
    res.redirect('/shop')
  }
}

exports.createOrder = (req, res) => {
  const cart = req.session.cart || { items: [] }
  if (!cart.items.length) {
    req.flash('error', 'Cart is empty')
    return res.redirect('/cart')
  }
  req.session.orders = req.session.orders || []
  const order = {
    id: `ord-${Date.now()}`,
    items: cart.items,
    total: cart.items.reduce((s, it) => s + it.product.price * it.quantity, 0),
    date: new Date()
  }
  req.session.orders.unshift(order)
  req.session.cart = { items: [] }
  req.flash('success', 'Order placed successfully')
  res.redirect('/history')
}

exports.viewHistory = (req, res) => {
  const orders = req.session.orders || []
  res.render('order-history', { orders, title: 'Order History' })
}