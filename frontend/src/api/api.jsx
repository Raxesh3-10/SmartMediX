import axios from "axios";

/**
 * Axios instance configuration
 * Adjust baseURL if backend runs on a different host/port
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Optional: attach JWT automatically if stored in localStorage
 * Admin APIs require header name: JWT
 * Auth logout requires header name: Authorization
 */
api.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem("JWT");
    if (jwt) {
      config.headers["JWT"] = jwt;
      config.headers["Authorization"] = jwt;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================================
   AUTH API
   Maps to: /api/auth/**
====================================================== */

export const AuthAPI = {
  signup: (data) =>
    api.post("/auth/signup", data),

  verifyOtp: (data) =>
    api.post("/auth/verify-otp", data),

  login: (data) =>
    api.post("/auth/login", data),

  updateProfile: (data) =>
    api.post("/auth/update-profile", data),

  logout: () =>
    api.post("/auth/logout"),
};

/* ======================================================
   ADMIN API
   Maps to: /api/admin/**
====================================================== */

export const AdminAPI = {
  // ===== USERS =====
  getAllUsers: () =>
    api.get("/admin/users"),

  getUserById: (id) =>
    api.get(`/admin/users/${id}`),

  createUser: (user) =>
    api.post("/admin/users", user),

  updateUser: (id, user) =>
    api.put(`/admin/users/${id}`, user),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  // ===== SESSIONS =====
  getActiveSessions: () =>
    api.get("/admin/sessions"),
};

export default api;