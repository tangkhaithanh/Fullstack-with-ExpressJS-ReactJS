import axios from './axios.customize';

const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name, email, password
  };

  return axios.post(URL_API, data);
}

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email, password
  };

  return axios.post(URL_API, data);
}

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
}
// Products
// Products
const getProductsApi = ({ category = 'all', page = 1, limit = 10 } = {}) => {
  return axios.get("/v1/api/products", { params: { category, page, limit } });
};

const createProductApi = (payload) => {
  return axios.post("/v1/api/products", payload);
};

const getProductByIdApi = (id) => {
  return axios.get(`/v1/api/products/${id}`);
};

const searchProductsApi = ({ keyword, category = 'all', minPrice, maxPrice, page = 1, limit = 10 } = {}) => {
  const params = { keyword, category, page, limit };

  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;

  return axios.get("/v1/api/products/search", { params });
};


export {
  createUserApi,
  loginApi,
  getUserApi,
  getProductsApi,
  createProductApi,
  getProductByIdApi,
  searchProductsApi
}
