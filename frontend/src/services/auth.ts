import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",  // Default to localhost in dev
});

// Add token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    console.log("Adding Authorization header:", `Bearer ${token}`); // Debugging
    config.headers.Authorization = `Bearer ${token}`;
  }
  else {
    console.log("No access token found."); // Debugging
    }
  return config;
});

// Refresh token on 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log("401 Unauthorized error - attempting to refresh token"); // Debugging
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          console.log("Refreshing token with refreshToken:", refreshToken); // Debugging
          try {
            const { data } = await axios.post("/core/refresh/", { refresh: refreshToken });
            console.log("Token refreshed successfully:", data); // Debugging
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);

            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            return apiClient(originalRequest);
          } catch (err) {
            console.error("Token refresh failed. Logging out user.", err); // Debugging
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(err);
          }
        } else {
          console.log("No refresh token available."); // Debugging
        }
      }
      return Promise.reject(error);
    }
  );


// Public Token
export const getPublicToken = async () => {
  console.log("Fetching public token..."); // Debugging
  const { data } = await apiClient.post("/core/public-token/", {});
  console.log("Public token received:", data); // Debugging
  localStorage.setItem("accessToken", data.access);
  return data;
};

// Login
export const login = async (credentials: { email: string; password: string }) => {
  console.log("Logging in with credentials:", credentials); // Debugging
  const { data } = await apiClient.post("/core/login/", credentials);
  console.log("Login successful. Tokens received:", data); // Debugging
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
};

// Logout
export const logout = () => {
  console.log("Logging out user and clearing storage."); // Debugging
  localStorage.clear();
  window.location.href = "/";
};

// Fetch Authenticated User
export const getUserDetails = async () => {
  console.log("Fetching authenticated user details..."); // Debugging
  const { data } = await apiClient.get("/core/me/");
  console.log("Authenticated user details received:", data); // Debugging
  return data;
};

export default apiClient;
