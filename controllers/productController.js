// In-memory product data (you'll use DB later)
const products = [
  { id: 'p1', name: 'Red T-Shirt', price: 19.99, description: 'Comfortable cotton t-shirt', image: 'product1.svg', category: 'Clothing' },
  { id: 'p2', name: 'Blue Jeans', price: 49.99, description: 'Stylish denim jeans', image: 'product2.svg', category: 'Clothing' },
  { id: 'p3', name: 'Sneakers', price: 69.99, description: 'Sporty sneakers for daily wear', image: 'product3.svg', category: 'Shoes' },
  { id: 'p4', name: 'Leather Wallet', price: 29.99, description: 'Classic leather wallet', image: 'product4.svg', category: 'Accessories' }
]

exports.home = (req, res) => {
  res.render('home', { products: products, title: 'Home' })
}

exports.viewProducts = (req, res) => {
  res.render('shop', { products: products, title: 'Shop' })
}

exports.viewProduct = (req, res) => {
  const product = products.find(p => p.id === req.params.id)
  if (!product) return res.status(404).render('404')
  res.render('single-product', { product, title: product.name })
}

exports._products = products;


exports._products = products