const mongoose = require('mongoose');


const URI = process.env.MONGODB_URI;

const connect_database = async () => {
  try {
  
    //console.log('MongoDB URI:', URI);
    await mongoose.connect(URI);
    console.log("Database connection successful");
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connect_database;


