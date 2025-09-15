// ...existing code...
const dotenv = require('dotenv');
dotenv.config(); // load env variables from .env file

const mongoose = require('mongoose');

const dbState = [
  { value: 0, label: 'Disconnected' },
  { value: 1, label: 'Connected' },
  { value: 2, label: 'Connecting' },
  { value: 3, label: 'Disconnecting' },
];

const connectDatabase = async () => {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/recruitment';
  try {
    await mongoose.connect(uri);
    const state = Number(mongoose.connection.readyState);
    console.log(dbState.find(f => f.value === state)?.label ?? 'Unknown', 'to database');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

mongoose.connection.on('connected', () => console.log('Mongoose: connected'));
mongoose.connection.on('disconnected', () => console.log('Mongoose: disconnected'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));

module.exports = connectDatabase;
// ...existing code...