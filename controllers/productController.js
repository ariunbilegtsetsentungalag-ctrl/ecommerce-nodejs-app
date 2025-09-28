
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
    let product;
    const id = req.params.id;
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Try to find by MongoDB _id
      product = await Product.findById(id);
    } else {
      // Try to find by productId for legacy products
      product = await Product.findOne({ productId: id });
    }
    
    if (!product) {
      return res.status(404).render('404', { title: '404 - Product Not Found' });
    }
    
    res.render('single-product', { product: product, title: product.name });
  } catch (error) {
    console.error('Product view error:', error);
    res.status(404).render('404', { title: '404 - Product Not Found' });
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