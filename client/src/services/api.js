import axios from 'axios';

// HTTP-only cookie carries the session; withCredentials ensures it's sent.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);

export default api;
