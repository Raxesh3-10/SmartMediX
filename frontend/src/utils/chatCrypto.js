import CryptoJS from "crypto-js";

/* ================= KEY ================= */
// Same for doctor & patient
export const deriveChatKey = (doctorId, patientId) =>
  CryptoJS.SHA256(`${doctorId}:${patientId}`).toString();

/* ================= ENCRYPT ================= */
export const encryptMessage = (plainText, doctorId, patientId) => {
  if (!plainText) return plainText;
  const key = deriveChatKey(doctorId, patientId);
  return CryptoJS.AES.encrypt(plainText, key).toString();
};

/* ================= DECRYPT ================= */
export const decryptMessage = (cipherText, doctorId, patientId) => {
  if (!cipherText) return cipherText;
  try {
    const key = deriveChatKey(doctorId, patientId);
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Unable to decrypt]";
  }
};