
const Product = require('../models/Product');


const staticProducts = [
  { 
    id: 'p1', 
    name: 'Premium Bedding Set', 
    basePrice: 41.50, 
    description: 'High-quality bedding set with multiple size options. Made from premium materials for maximum comfort.',
    image: 'product1.svg', 
    category: 'Home & Living',
    images: ['product1.svg', 'product1.jpg'],
    sizes: [
      { name: '180×260', price: 41.50 },
      { name: '180×340', price: 53.50 },
      { name: '180×380', price: 57.50 }
    ],
    colors: [
      { name: 'Beige', code: '#F5F5DC', image: 'product1.svg' },
      { name: 'Gray', code: '#808080', image: 'product1-gray.svg' },
      { name: 'Blue', code: '#4682B4', image: 'product1-blue.svg' },
      { name: 'Green', code: '#8FBC8F', image: 'product1-green.svg' }
    ],
    features: [
      'High-quality fabric',
      'Machine washable',
      'Fade-resistant colors',
      'Soft and comfortable'
    ]
  },
  { 
    id: 'p2', 
    name: 'Designer Jeans', 
    basePrice: 49.99, 
    description: 'Stylish premium denim jeans with perfect fit',
    image: 'product2.svg', 
    category: 'Clothing',
    images: ['product2.svg', 'product2.jpg'],
    sizes: [
      { name: 'S', price: 49.99 },
      { name: 'M', price: 49.99 },
      { name: 'L', price: 52.99 },
      { name: 'XL', price: 55.99 }
    ],
    colors: [
      { name: 'Blue', code: '#4169E1', image: 'product2.svg' },
      { name: 'Black', code: '#000000', image: 'product2-black.svg' }
    ]
  },
  { 
    id: 'p3', 
    name: 'Sport Sneakers', 
    basePrice: 69.99, 
    description: 'Professional athletic shoes for all activities',
    image: 'product3.svg', 
    category: 'Shoes',
    images: ['product3.svg', 'product3.jpg'],
    sizes: [
      { name: '39', price: 69.99 },
      { name: '40', price: 69.99 },
      { name: '41', price: 72.99 },
      { name: '42', price: 72.99 }
    ],
    colors: [
      { name: 'White', code: '#FFFFFF', image: 'product3.svg' },
      { name: 'Red', code: '#FF0000', image: 'product3-red.svg' }
    ]
  },
  { 
    id: 'p4', 
    name: 'Luxury Wallet', 
    basePrice: 29.99, 
    description: 'Premium leather wallet with multiple compartments',
    image: 'product4.svg', 
    category: 'Accessories',
    images: ['product4.svg', 'product4.jpg'],
    colors: [
      { name: 'Brown', code: '#8B4513', image: 'product4.svg' },
      { name: 'Black', code: '#000000', image: 'product4-black.svg' }
    ]
  }
]

exports.home = async (req, res) => {
  try {
    const products = await Product.find({ inStock: true }).limit(8);
    res.render('home', { products: products, title: 'Home' });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('home', { products: [], title: 'Home' });
  }
}

exports.viewProducts = async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.render('shop', { products: products, title: 'Shop' });
  } catch (error) {
    console.error('Shop page error:', error);
    res.render('shop', { products: [], title: 'Shop' });
  }
}

exports.viewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render('404');
    }
    
    res.render('single-product', { product: product, title: product.name });
  } catch (error) {
    console.error('Product view error:', error);
    res.status(404).render('404');
  }
}

// Helper function to get product by ID (for cart system)
exports.getProductById = async (productId) => {
  try {
    return await Product.findById(productId);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}