const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: ' + conn.connection.host);} catch (error) {
  console.error('Error: ' + error.message);    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('Destroying existing data...');
    await MenuItem.deleteMany();
    await Table.deleteMany();
    await User.deleteMany();

    console.log('Seeding Menu Items...');
    const menuItems = [
      { name: 'Espresso', description: 'Strong black coffee', category: 'Drinks', price: 3.5, preparation_time_minutes: 5 },
      { name: 'Latte', description: 'Espresso with steamed milk', category: 'Drinks', price: 5.0, preparation_time_minutes: 7 },
      { name: 'Croissant', description: 'Flaky, buttery pastry', category: 'Pastries', price: 4.0, preparation_time_minutes: 2 },
      { name: 'Blueberry Muffin', description: 'Sweet muffin with fresh blueberries', category: 'Pastries', price: 4.5, preparation_time_minutes: 2 },
      { name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing', category: 'Food', price: 12.0, preparation_time_minutes: 10 },
      { name: 'Club Sandwich', description: 'Triple-decker sandwich with turkey, bacon, lettuce, and tomato', category: 'Food', price: 15.0, preparation_time_minutes: 15 },
    ];
    await MenuItem.insertMany(menuItems);

    console.log('Seeding Tables...');
    const tables = [
      { table_number: 1, capacity: 2, status: 'available' },
      { table_number: 2, capacity: 4, status: 'available' },
      { table_number: 3, capacity: 6, status: 'available' },
      { table_number: 4, capacity: 2, status: 'available' },
      { table_number: 5, capacity: 4, status: 'available' },
    ];
    await Table.insertMany(tables);

    console.log('Seeding Users...');
    const users = [
      { username: 'admin', password: 'password123', role: 'admin' },
      { username: 'staff1', password: 'password123', role: 'staff' },
      { username: 'kitchen1', password: 'password123', role: 'kitchen' },
    ];
    // Use the pre-save hook in the User model to hash the password
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log('Data Seeded!');
    process.exit();
  } catch (error) {
  console.error('Error with data seeding: ' + error.message);    process.exit(1);
  }
};

seedData();
