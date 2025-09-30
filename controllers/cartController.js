const Order = require('../models/Order');

exports.viewCart = (req, res) => {
  const cart = req.session.cart || { items: [] }
  res.render('cart', { cart, title: 'My Cart' })
}

exports.addToCart = async (req, res) => {
  try {
    const productId = req.body.productId
    const quantity = parseInt(req.body.quantity) || 1
    const selectedSize = req.body.selectedSize
    const selectedColor = req.body.selectedColor

    const Product = require('../models/Product')
    const product = await Product.findById(productId)
    
    if (!product) {
      req.flash('error', 'Product not found')
      return res.redirect('/shop')
    }

    if (product.stockQuantity <= 0) {
      req.flash('error', 'This product is currently out of stock')
      return res.redirect('/shop')
    }

    if (product.stockQuantity < quantity) {
      req.flash('error', `Only ${product.stockQuantity} items available in stock`)
      return res.redirect(`/product/${productId}`)
    }

    req.session.cart = req.session.cart || { items: [] }
    const existingCartItem = req.session.cart.items.find(item => 
      item.product._id.toString() === product._id.toString() && 
      item.options.size === selectedSize && 
      item.options.color === selectedColor
    )
    
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0
    const totalRequestedQuantity = currentCartQuantity + quantity
    
    if (product.stockQuantity < totalRequestedQuantity) {
      req.flash('error', `Cannot add ${quantity} more items. Only ${product.stockQuantity - currentCartQuantity} items available (${currentCartQuantity} already in cart)`)
      return res.redirect(`/product/${productId}`)
    }

  
    let itemPrice = product.basePrice
    if (selectedSize && product.sizes && product.sizes.length > 0) {
      const sizeOption = product.sizes.find(s => s.name === selectedSize)
      if (sizeOption) {
        itemPrice = sizeOption.price
      }
    }

    const cartItem = {
      product: {
        _id: product._id,
        name: product.name,
        image: product.image,
        basePrice: product.basePrice,
        price: itemPrice
      },
      quantity,
      options: {
        size: selectedSize,
        color: selectedColor
      }
    }

    req.session.cart = req.session.cart || { items: [] }
    
    const existing = req.session.cart.items.find(item => 
      item.product._id.toString() === product._id.toString() && 
      item.options.size === selectedSize && 
      item.options.color === selectedColor
    )
    
    if (existing) {
      existing.quantity += quantity
    } else {
      req.session.cart.items.push(cartItem)
    }
    
    req.flash('success', `Added ${product.name} to cart`)
    res.redirect('/shop')
  } catch (error) {
    console.error('Add to cart error:', error)
    req.flash('error', 'Error adding product to cart')
    res.redirect('/shop')
  }
}

exports.removeFromCart = (req, res) => {
  const id = req.params.id
  req.session.cart = req.session.cart || { items: [] }
  req.session.cart.items = req.session.cart.items.filter(i => i.product._id.toString() !== id)
  res.redirect('/cart')
}

exports.checkout = async (req, res) => {
  try {
    const cart = req.session.cart || { items: [] }
    if (cart.items.length === 0) {
      req.flash('error', 'Your cart is empty')
      return res.redirect('/cart')
    }

    const Product = require('../models/Product')
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id)
      if (!product) {
        req.flash('error', `Product ${item.product.name} no longer exists`)
        return res.redirect('/cart')
      }
      if (product.stockQuantity < item.quantity) {
        req.flash('error', `${item.product.name} is out of stock or insufficient quantity available`)
        return res.redirect('/cart')
      }
    }

    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0)

    const order = new Order({
      user: req.session.userId,
      products: cart.items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      totalAmount
    })

    await order.save()


    for (const item of cart.items) {
      const newStockQuantity = await Product.findByIdAndUpdate(
        item.product._id,
        { 
          $inc: { stockQuantity: -item.quantity },
        },
        { new: true }
      )

      if (newStockQuantity.stockQuantity <= 0) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { 
            stockQuantity: 0,
            inStock: false 
          }
        )
      } else {
        await Product.findByIdAndUpdate(
          item.product._id,
          { inStock: true }
        )
      }
    }

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