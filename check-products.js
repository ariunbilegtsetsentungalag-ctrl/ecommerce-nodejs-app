require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('Connected to MongoDB Atlas...');

    const products = await Product.find({}, 'name stockQuantity inStock');
    console.log('📦 Found products:');
    products.forEach((p, index) => {
      console.log(`${index + 1}. Name: "${p.name}"`);
      console.log(`   Stock: ${p.stockQuantity || 'undefined'}`);
      console.log(`   In Stock: ${p.inStock}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkProducts();