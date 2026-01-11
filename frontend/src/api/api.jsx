import axios from "axios";

/**
 * ======================================================
 * AXIOS INSTANCE
 * ======================================================
 */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ======================================================
 * JWT INTERCEPTOR
 * - Backend expects header name: JWT
 * - Some auth APIs also read Authorization
 * ======================================================
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
   CHAT API
   Maps to: /api/chat/**
====================================================== */

export const ChatAPI = {
  /* ========== SEND MESSAGE ========== */
  sendMessage: (data) =>
    api.post("/chat/send", null, {
      params: {
        doctorId: data.doctorId,
        patientId: data.patientId,
        senderRole: data.senderRole, // "DOCTOR" | "PATIENT"
        senderId: data.senderId,
        message: data.message,
        fileUrls: data.fileUrls, // array of cloudinary URLs
      },
    }),

  /* ========== CHAT HISTORY ========== */
  getChatHistory: (doctorId, patientId) =>
    api.get(`/chat/history/${doctorId}/${patientId}`),

  getPatientChatHistory: (patientId, doctorId) =>
    api.get(`/chat/patient/history/${patientId}/${doctorId}`),

  /* ========== DOCTOR ROUTES ========== */
  getDoctorChatPatients: (doctorId) =>
    api.get(`/chat/doctor/${doctorId}/patients`),

  getDoctorNewPatients: (doctorId) =>
    api.get(`/chat/doctor/${doctorId}/new-patients`),

  /* ========== PATIENT ROUTES ========== */
  getPatientChatDoctors: (patientId) =>
    api.get(`/chat/patient/${patientId}/doctors`),

  getPatientNewDoctors: (patientId) =>
    api.get(`/chat/patient/${patientId}/new-doctors`),
};

/* ======================================================
   CHAT FILE API (CLOUDINARY)
   Maps to: /api/chat/files/**
====================================================== */

export const ChatFileAPI = {
  uploadImage: (file, ownerId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", ownerId);

    return api.post("/chat/files/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadDocument: (file, ownerId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", ownerId);

    return api.post("/chat/files/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

/* ======================================================
   AUTH API
   Maps to: /api/auth/**
====================================================== */

export const AuthAPI = {
  signup: (data) => api.post("/auth/signup", data),

  verifyOtp: (data) => api.post("/auth/verify-otp", data),

  login: (data) => api.post("/auth/login", data),

  updateProfile: (data) => api.post("/auth/update-profile", data),

  logout: () => api.post("/auth/logout"),

  getUser: () => api.get("/auth/profile"),
};

/* ======================================================
   ADMIN API
   Maps to: /api/admin/**
====================================================== */

export const AdminAPI = {
  getAllUsers: () => api.get("/admin/users"),

  getUserById: (id) => api.get(`/admin/users/${id}`),

  createUser: (user) => api.post("/admin/users", user),

  updateUser: (id, user) => api.put(`/admin/users/${id}`, user),

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getActiveSessions: () => api.get("/admin/sessions"),
};

/* ======================================================
   DOCTOR API
   Maps to: /api/doctors/**
====================================================== */

export const DoctorAPI = {
  createProfile: (doctorData) =>
    api.post("/doctors", doctorData),

  getMyProfile: () =>
    api.get("/doctors/me"),

  updateProfile: (doctorId, doctorData) =>
    api.put(`/doctors/${doctorId}`, doctorData),

  deleteProfile: (doctorId) =>
    api.delete(`/doctors/${doctorId}`),
};

export const PatientAPI = {

  createProfile: (patientData) =>
    api.post("/patients", patientData),

  getMyProfile: () =>
  api.get("/patients/me", {
    headers: {
      JWT: localStorage.getItem("jwt"),
    },
  }),

  updateProfile: (patientId, patientData) =>
    api.put(`/patients/${patientId}`, patientData),

  deleteProfile: (patientId) =>
    api.delete(`/patients/${patientId}`),
};

export default api;