require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testProductVisibility() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: 'App'
    });
    console.log('Connected to MongoDB Atlas...\n');

    console.log('🛍️ TESTING PRODUCT VISIBILITY FOR CUSTOMERS:\n');

    // Test the same query used in the shop controller
    const products = await Product.find({}).sort({ inStock: -1, stockQuantity: -1 });
    
    console.log(`📦 TOTAL PRODUCTS VISIBLE: ${products.length}\n`);

    console.log('📋 PRODUCT LIST (as customers will see):');
    products.forEach((p, index) => {
      const stockStatus = !p.inStock || p.stockQuantity === 0 ? '❌ OUT OF STOCK' : 
                         p.stockQuantity <= 5 ? '⚠️ LOW STOCK' : 
                         '✅ IN STOCK';
      
      const buttonStatus = (!p.inStock || p.stockQuantity === 0) ? 
                          '[BUTTON: Out of Stock - DISABLED]' : 
                          '[BUTTON: Add to Cart - ENABLED]';
      
      console.log(`${index + 1}. "${p.name}"`);
      console.log(`   💰 Price: $${p.basePrice}`);
      console.log(`   📊 Stock: ${p.stockQuantity} units ${stockStatus}`);
      console.log(`   🎯 ${buttonStatus}`);
      console.log(`   👁️ Details: Available to view`);
      console.log('');
    });

    console.log('✅ CUSTOMER EXPERIENCE SUMMARY:');
    const inStockCount = products.filter(p => p.inStock && p.stockQuantity > 0).length;
    const outOfStockCount = products.filter(p => !p.inStock || p.stockQuantity === 0).length;
    const lowStockCount = products.filter(p => p.inStock && p.stockQuantity > 0 && p.stockQuantity <= 5).length;
    
    console.log(`🛒 Purchasable products: ${inStockCount}`);
    console.log(`⚠️ Low stock warnings: ${lowStockCount}`);
    console.log(`👁️ Out of stock (view only): ${outOfStockCount}`);
    console.log(`📱 All products browseable: ${products.length}`);
    
    console.log('\n🎯 SORTING ORDER:');
    console.log('1. In-stock products shown first');
    console.log('2. Higher stock quantities prioritized');
    console.log('3. Out-of-stock products shown last');
    console.log('4. All products remain discoverable');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testProductVisibility();