// Script to clear all database collections except admin
const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        // Clear each collection
        for (let collection of collections) {
            await mongoose.connection.db.collection(collection.name).deleteMany({});
            console.log(`Cleared collection: ${collection.name}`);
        }

        console.log('✅ Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

clearDatabase();
