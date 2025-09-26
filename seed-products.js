// Script to add static products to MongoDB database
// Usage: node seed-products.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const dbURI = process.env.CONNECTION_STRING;

const staticProducts = [
  { 
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
    ],
    stockQuantity: 100,
    inStock: true
  },
  { 
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
    ],
    features: [
      'Premium denim fabric',
      'Comfortable fit',
      'Durable construction'
    ],
    stockQuantity: 50,
    inStock: true
  },
  { 
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
    ],
    features: [
      'Breathable material',
      'Non-slip sole',
      'Comfortable padding'
    ],
    stockQuantity: 30,
    inStock: true
  },
  { 
    name: 'Luxury Wallet', 
    basePrice: 29.99, 
    description: 'Premium leather wallet with multiple compartments',
    image: 'product4.svg', 
    category: 'Accessories',
    images: ['product4.svg', 'product4.jpg'],
    colors: [
      { name: 'Brown', code: '#8B4513', image: 'product4.svg' },
      { name: 'Black', code: '#000000', image: 'product4-black.svg' }
    ],
    features: [
      'Genuine leather',
      'Multiple card slots',
      'Compact design'
    ],
    stockQuantity: 25,
    inStock: true
  }
];

async function seedProducts() {
  try {
    // Connect to database
    await mongoose.connect(dbURI, { dbName: 'App' });
    console.log('Connected to MongoDB Atlas...');

    // Find an admin user to assign as creator
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating a system admin...');
      adminUser = new User({
        username: 'system',
        email: 'system@shop.com',
        password: 'temp123', // This won't be used for login
        role: 'admin'
      });
      await adminUser.save();
    }

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    // Add products to database
    for (const productData of staticProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ name: productData.name });
      
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          createdBy: adminUser._id
        });
        
        await product.save();
        console.log(`✅ Added product: ${product.name}`);
      } else {
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log('\n🎉 Product seeding completed!');
    console.log(`Total products in database: ${await Product.countDocuments()}`);
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedProducts();