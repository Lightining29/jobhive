import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
});

if (
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !import.meta.env.VITE_API_URL
) {
  console.warn(
    '[JobHive Configuration Warning] VITE_API_URL environment variable is missing. API requests are using relative "/api". If your backend is deployed on a separate domain/URL, configure VITE_API_URL in your hosting provider build environment settings.'
  );
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject({ ...err, message });
  }
);

export default api;
