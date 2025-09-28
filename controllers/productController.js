
const Product = require('../models/Product');

exports.home = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ inStock: -1, stockQuantity: -1 }).limit(8);
    res.render('home', { products: products, title: 'Home' });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('home', { products: [], title: 'Home' });
  }
}

exports.viewProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ inStock: -1, stockQuantity: -1 });
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


exports.getProductById = async (productId) => {
  try {
    return await Product.findById(productId);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}