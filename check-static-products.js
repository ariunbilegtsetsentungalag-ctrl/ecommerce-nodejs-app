require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkStaticProductsInDatabase() {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: 'App'
    });
    console.log('Connected to MongoDB Atlas...\n');

    // Static products from your code
    const staticProductNames = [
      'Premium Bedding Set',
      'Designer Jeans', 
      'Sport Sneakers',
      'Luxury Wallet'
    ];

    console.log('🔍 CHECKING DATABASE FOR STATIC PRODUCTS:\n');

    let foundProducts = [];
    let missingProducts = [];

    for (const productName of staticProductNames) {
      const product = await Product.findOne({ name: productName });
      
      if (product) {
        console.log(`✅ FOUND: "${productName}"`);
        console.log(`   - Database ID: ${product._id}`);
        console.log(`   - Stock: ${product.stockQuantity} units`);
        console.log(`   - In Stock: ${product.inStock}`);
        console.log(`   - Created By: ${product.createdBy}`);
        console.log(`   - Has Sizes: ${product.sizes ? product.sizes.length : 0} options`);
        console.log(`   - Has Colors: ${product.colors ? product.colors.length : 0} options`);
        foundProducts.push(productName);
      } else {
        console.log(`❌ MISSING: "${productName}"`);
        missingProducts.push(productName);
      }
      console.log('');
    }

    console.log('📊 SUMMARY:');
    console.log(`✅ Found in database: ${foundProducts.length}/${staticProductNames.length}`);
    console.log(`❌ Missing from database: ${missingProducts.length}/${staticProductNames.length}`);

    if (foundProducts.length > 0) {
      console.log('\n✅ Found products:', foundProducts.join(', '));
    }
    if (missingProducts.length > 0) {
      console.log('\n❌ Missing products:', missingProducts.join(', '));
    }

    console.log('\n💡 RECOMMENDATION:');
    if (foundProducts.length === staticProductNames.length) {
      console.log('🗑️  All static products exist in database.');
      console.log('    You can SAFELY REMOVE the staticProducts array from your code!');
      console.log('    Your application is already using database products only.');
    } else if (foundProducts.length > 0) {
      console.log('⚠️  Some products exist in database, some don\'t.');
      console.log('    Consider running seed script to add missing products first.');
    } else {
      console.log('🚨 No static products found in database.');
      console.log('    Run seed-products.js to populate database first.');
    }

    // Show all products currently in database
    const allProducts = await Product.find({}, 'name stockQuantity inStock');
    console.log(`\n📦 ALL PRODUCTS IN DATABASE (${allProducts.length} total):`);
    allProducts.forEach((p, index) => {
      const status = !p.inStock ? '❌ OUT' : 
                     p.stockQuantity <= 5 ? '⚠️ LOW' : 
                     '✅ OK';
      console.log(`${index + 1}. "${p.name}" - ${p.stockQuantity} units ${status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkStaticProductsInDatabase();