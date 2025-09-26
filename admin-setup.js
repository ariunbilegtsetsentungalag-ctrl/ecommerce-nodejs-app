// Run this script once to make your first user an admin
// Usage: node admin-setup.js your_username

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const dbURI = process.env.CONNECTION_STRING;

async function makeAdmin() {
  try {
    // Connect to database
    await mongoose.connect(dbURI, { dbName: 'App' });
    console.log('Connected to MongoDB Atlas...');

    const username = process.argv[2];
    
    if (!username) {
      console.log('Usage: node admin-setup.js <username>');
      console.log('Example: node admin-setup.js myusername');
      process.exit(1);
    }

    // Find user and make them admin
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User "${username}" not found.`);
      console.log('Please make sure the user exists by signing up first.');
      process.exit(1);
    }

    user.role = 'admin';
    user.permissions = ['manage_products', 'manage_users'];
    await user.save();

    console.log(`✅ Success! User "${username}" is now an admin.`);
    console.log(`They can now access the admin panel at: /admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeAdmin();