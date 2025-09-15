// ...existing code...
const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const {
  createProduct,
  listProducts,
  searchProducts
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Public routes (no auth)
routerAPI.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from API' });
});
routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

// Products - public
routerAPI.get('/products', listProducts);
routerAPI.post('/products', createProduct); // simple create for testing (remove/protect in prod)
routerAPI.get('/products/search', searchProducts);
// Apply auth middleware for all routes below
routerAPI.use(auth);

routerAPI.get('/user', getUser);
routerAPI.get('/account', delay, getAccount);

module.exports = routerAPI;
// ...existing code...