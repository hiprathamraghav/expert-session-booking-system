import axios from "axios";

const localHosts = ["localhost", "127.0.0.1"];
const defaultApiUrl = localHosts.includes(window.location.hostname)
  ? "http://127.0.0.1:5000/api"
  : "/api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  timeout: 15000
});

export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}
