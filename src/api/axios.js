import axios from "axios";

const api = axios.create({
  baseURL: "https://lexi-med-ai-llm-rs-back-end.vercel.app/api",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Otomatis tempel token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
