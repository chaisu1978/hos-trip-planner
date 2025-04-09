import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",  // Default to localhost in dev
});

// Add token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh token on 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const { data } = await axios.post("/core/refresh/", { refresh: refreshToken });
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);

            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            return apiClient(originalRequest);
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error("Token refresh failed. Logging out user.", err);
            }
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(err);
          }
        }
      }
      return Promise.reject(error);
    }
  );


// Public Token
export const getPublicToken = async () => {
  const { data } = await apiClient.post("/core/public-token/", {});
  localStorage.setItem("accessToken", data.access);
  return data;
};

// Login
export const login = async (credentials: { email: string; password: string }) => {
  const { data } = await apiClient.post("/core/login/", credentials);
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
};

// Logout
export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};

// Fetch Authenticated User
export const getUserDetails = async () => {
  const { data } = await apiClient.get("/core/me/");
  return data;
};

export default apiClient;
