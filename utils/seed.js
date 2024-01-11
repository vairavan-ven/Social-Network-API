const connection = require('../config/connection');
const { User, Thought } = require('../models');

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Delete existing collections if they exist
    let usersCheck = await connection.db.listCollections({ name: 'users' }).toArray();
    if (usersCheck.length) {
      await connection.dropCollection('users');
    }

    let thoughtsCheck = await connection.db.listCollections({ name: 'thoughts' }).toArray();
    if (thoughtsCheck.length) {
      await connection.dropCollection('thoughts');
    }

    // Create an array of predefined users with specific thoughts
    const users = [
      {
        username: 'user1',
        email: 'user1@example.com',
        thoughts: [
         'I am hungry'
        ]
      },
      
    ];

    await User.collection.insertMany(users);

    console.table(users);
    console.info('Seeding complete! 🌱');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
