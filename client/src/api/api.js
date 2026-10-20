import axios from "axios";

const api = axios.create({
    // In development, use Vite's /api proxy so requests work on any dev port.
    baseURL: import.meta.env.DEV ? "" : (import.meta.env.VITE_BASE_URL || ""),
    withCredentials: true,
});


export default api;
