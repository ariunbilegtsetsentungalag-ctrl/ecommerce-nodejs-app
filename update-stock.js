require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function updateProductStock() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: 'App'
    });
    console.log('Connected to MongoDB Atlas...');

    // First, get all existing products
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products in database`);

    if (allProducts.length === 0) {
      console.log('No products found. Please run seed-products.js first');
      return;
    }

    // Update all products with random realistic stock quantities
    const stockRanges = [5, 8, 12, 15, 20, 25, 30, 35];
    
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      const randomStock = stockRanges[i % stockRanges.length];
      
      const result = await Product.updateOne(
        { _id: product._id },
        { 
          $set: { 
            stockQuantity: randomStock,
            inStock: randomStock > 0
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated stock for "${product.name}": ${randomStock} units`);
      }
    }

    const totalProducts = await Product.countDocuments();
    console.log(`🎉 Stock update completed! Total products: ${totalProducts}`);
    
    // Show current stock status
    const products = await Product.find({}, 'name stockQuantity inStock');
    console.log('\n📦 Current Stock Status:');
    products.forEach(p => {
      const status = !p.inStock ? '❌ OUT OF STOCK' : 
                     p.stockQuantity <= 5 ? '⚠️ LOW STOCK' : 
                     '✅ IN STOCK';
      console.log(`  ${p.name}: ${p.stockQuantity} units ${status}`);
    });

  } catch (error) {
    console.error('Error updating stock:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

updateProductStock();