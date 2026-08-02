import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject({ ...err, message });
  }
);

export default api;
