import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://saqlain-cloth-house-1.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export default API_BASE_URL;
export { api };
