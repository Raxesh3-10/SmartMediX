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
  withCredentials: true,
});

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
        fileUrls: data.fileUrls,
      },
    }),

  /* ========== DELETE MESSAGE ========== */
  deleteMessage: (messageId) =>
    api.delete(`/chat/message/${messageId}`),

  /* ========== MARK READ ========== */
  markChatAsRead: (doctorId, patientId) =>
    api.patch(`/chat/read/${doctorId}/${patientId}`),
  
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
  /* ========== UPLOAD IMAGE ========== */
  uploadImage: (file, ownerId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", ownerId);

    return api.post("/chat/files/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /* ========== UPLOAD DOCUMENT ========== */
  uploadDocument: (file, ownerId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", ownerId);

    return api.post("/chat/files/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /* ========== DELETE IMAGE ========== */
  deleteImage: (publicId) =>
    api.delete("/chat/files/image", {
      params: { publicId },
    }),

  /* ========== DELETE DOCUMENT ========== */
  deleteDocument: (publicId) =>
    api.delete("/chat/files/document", {
      params: { publicId },
    }),
};

/* ======================================================
   AUTH API
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
====================================================== */

export const AdminAPI = {
  /* ================= DASHBOARD ================= */
  getDashboardStats: () => api.get("/admin/dashboard"),

  /* ================= USERS (FULL VIEW) ================= */

  // 🔥 Admin full user view (User + Patient/Doctor + Appointments + Transactions + Family)
  getAllUsersFull: () => api.get("/admin/users/full"),

  // 🔥 Admin full delete (removes related patient/doctor data safely)
  deleteUserFull: (userId) =>
    api.delete(`/admin/users/${userId}/full`),

  /* ================= ADMIN USER MANAGEMENT ================= */

  // Create ADMIN only
  createAdminUser: (user) =>
    api.post("/admin/users", user),

  // Update name / role only
  updateUser: (id, user) =>
    api.put(`/admin/users/${id}`, user),
};

/* ======================================================
   DOCTOR API
====================================================== */

export const DoctorAPI = {
  createProfile: (doctorData) => api.post("/doctors", doctorData),
  getMyProfile: () => api.get("/doctors/me"),
  updateProfile: (doctorId, doctorData) =>
    api.put(`/doctors/${doctorId}`, doctorData),
  deleteProfile: (doctorId) =>
    api.delete(`/doctors/${doctorId}`),
};

/* ======================================================
   PATIENT API
====================================================== */

export const PatientAPI = {
  createProfile: (patientData) =>
    api.post("/patients", patientData),

  getMyProfile: () =>
    api.get("/patients/me"),

  updateProfile: (patientId, patientData) =>
    api.put(`/patients/${patientId}`, patientData),

  deleteProfile: (patientId) =>
    api.delete(`/patients/${patientId}`),

  getAllPatients: () =>
    api.get("/patients"),
};


/* ======================================================
   APPOINTMENT API
====================================================== */

export const AppointmentAPI = {
  /* ========== CREATE APPOINTMENT ========== */
  createAppointment: (appointmentData, specialization = null) =>
    api.post("/appointments", appointmentData, {
      params: specialization ? { specialization } : {},
    }),
  /* ========== PATIENT → CREATE APPOINTMENT BY CHAT → DOCTOR and USER (ADDED) ========== */
  getDoctorForAIBot: () =>
    api.get(`/appointments/aibot`),
  /* ========== PATIENT → APPOINTMENTS (ADDED) ========== */
  getPatientAppointments: (patientId) =>
    api.get(`/appointments/patient/${patientId}`),
  /* ========== UPDATE / RESCHEDULE (NO PAYMENT) ========== */
  updateAppointment: (appointmentId, updatedData) =>
    api.put(`/appointments/${appointmentId}`, updatedData),

  /* ========== DOCTOR DASHBOARD ========== */
  getDoctorAppointments: (doctorId) =>
    api.get(`/appointments/doctor/${doctorId}`),

  /* ========== PATIENT → ASSOCIATED DOCTORS ========== */
  getPatientDoctors: (patientId) =>
    api.get(`/appointments/patient/${patientId}/doctors`),

  /* ========== COMPLETE APPOINTMENT ========== */
  completeAppointment: (appointmentId) =>
    api.post(`/appointments/${appointmentId}/complete`),
};

/* ======================================================
   PAYMENT API
====================================================== */

export const PaymentAPI = {
  /* ========== ONE CLICK PAYMENT (TEST MODE) ========== */
  payForAppointment: (appointmentId) =>
    api.post("/payments/pay", null, {
      params: { appointmentId },
    }),
    /* ========== TRANSACTION HISTORY (PATIENT / DOCTOR) ========== */
  getMyTransactions: () =>
    api.get("/payments/history"),
};

/* ======================================================
   FAMILY API
   Maps to: /api/family/**
====================================================== */

export const FamilyAPI = {
  /* ========== CREATE FAMILY ========== */
  createFamily: () =>
    api.post("/family/create"),

  /* ========== ADD FAMILY MEMBER ========== */
  addMember: ({ patientId, relation }) =>
    api.post("/family/add-member", {
      patientId,
      relation,
    }),

  /* ========== REMOVE FAMILY MEMBER ========== */
  removeMember: (patientId) =>
    api.delete(`/family/remove/${patientId}`),

  /* ========== GET FAMILY MEMBERS ========== */
  getMembers: () =>
    api.get("/family/members"),
};

export default api;