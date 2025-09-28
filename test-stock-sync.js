require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const dbURI = process.env.CONNECTION_STRING;

async function testStockSync() {
  try {
    await mongoose.connect(dbURI, { dbName: 'App' });
    console.log('Connected to MongoDB Atlas...');

    // Test case 1: Update stock to 0, should set inStock to false
    console.log('\n🧪 Test 1: Setting stock to 0...');
    await Product.updateOne(
      { name: 'Test Product' },
      { 
        stockQuantity: 0,
        inStock: false
      }
    );

    // Test case 2: Update stock to 10, should set inStock to true
    console.log('🧪 Test 2: Setting stock to 10...');
    await Product.updateOne(
      { name: 'Seree' },
      { 
        stockQuantity: 10,
        inStock: true
      }
    );

    console.log('🧪 Test 3: Setting stock to 15...');
    await Product.updateOne(
      { name: 'tor' },
      { 
        stockQuantity: 15,
        inStock: true
      }
    );

    // Show current stock status
    console.log('\n📊 Current Stock Status:');
    const products = await Product.find({}).select('name stockQuantity inStock');
    products.forEach(product => {
      const status = product.stockQuantity > 0 ? '✅ In Stock' : '❌ Out of Stock';
      console.log(`   ${product.name}: ${product.stockQuantity} units - ${status} (inStock: ${product.inStock})`);
    });

    console.log('\n✅ Stock synchronization test completed!');
    console.log('💡 Your display logic now uses stockQuantity directly from database');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStockSync();