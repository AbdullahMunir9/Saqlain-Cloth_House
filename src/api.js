import axios from 'axios';

const API_BASE_URL = 'https://saqlain-cloth-house-1.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export default API_BASE_URL;
export { api };
