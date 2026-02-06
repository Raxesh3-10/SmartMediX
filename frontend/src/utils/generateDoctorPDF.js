import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppointmentAPI, PaymentAPI } from "../api/api";

/* ================= CACHE KEYS ================= */
const CACHE_APPOINTMENTS = "cache_doctor_appointments";
const CACHE_TRANSACTIONS = "cache_doctor_transactions";

/* ================= SAFE PARSE ================= */
const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ================= DATE FORMAT ================= */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

/* ================= MAIN FUNCTION ================= */
export async function generateDoctorPDF({
  doctorId,
  doctorName,
  fromDate,
  toDate,
}) {
  /* ===== LOAD DATA (CACHE → SERVER) ===== */
  let appointments = safeParse(CACHE_APPOINTMENTS);
  let transactions = safeParse(CACHE_TRANSACTIONS);

  if (!appointments) {
    const res = await AppointmentAPI.getDoctorAppointments(doctorId);
    appointments = res.data || [];
    localStorage.setItem(CACHE_APPOINTMENTS, JSON.stringify(appointments));
  }

  if (!transactions) {
    const res = await PaymentAPI.getMyTransactions();
    transactions = res.data || [];
    localStorage.setItem(CACHE_TRANSACTIONS, JSON.stringify(transactions));
  }

  /* ===== NORMALIZE TRANSACTIONS ===== */
  const txList = transactions.map(r => ({
    transaction: r.transaction || r,
    patientEmail: r.patientEmail,
  }));

  /* ===== FILTER + JOIN ===== */
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const tableRows = [];
  const patientSet = new Set();
  let totalEarnings = 0;

  for (const a of appointments) {
    const apptDate = new Date(a.appointment.appointmentDate);
    if (apptDate < from || apptDate > to) continue;

    const tx = txList.find(
      t => t.patientEmail === a.user.email
    );

    const earning = Number(tx?.transaction.totalDoctorReceives || 0);
    totalEarnings += earning;
    patientSet.add(a.user.email);

    tableRows.push([
      formatDate(a.appointment.appointmentDate),
      a.appointment.startTime,
      a.appointment.endTime,
      a.user.name,
      a.user.email,
      tx ? formatDate(tx.transaction.paidAt) : "—",
      ` ${earning}/-`,
    ]);
  }

  /* ================= PDF ================= */
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFontSize(18);
  doc.text("Doctor Appointment & Earnings Report", 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Doctor: Dr. ${doctorName}`, 14, 30);
  doc.text(
    `Period: ${formatDate(fromDate)}  –  ${formatDate(toDate)}`,
    14,
    36
  );

  /* ===== TABLE ===== */
  autoTable(doc, {
    startY: 45,
    head: [[
      "Date",
      "Start",
      "End",
      "Patient Name",
      "Patient Email",
      "Paid On",
      "Earned",
    ]],
    body: tableRows,
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  /* ===== SUMMARY BOX ===== */
  const y = doc.lastAutoTable.finalY + 12;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.rect(14, y, 180, 28);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Summary", 18, y + 8);

  doc.setFontSize(11);
  doc.text(`Total Appointments: ${tableRows.length}`, 18, y + 16);
  doc.text(`Total Patients: ${patientSet.size}`, 90, y + 16);
  doc.text(
    `Total Earnings: ${totalEarnings.toLocaleString("en-IN")} /-`,
    18,
    y + 24
  );

  /* ===== SAVE ===== */
  doc.save(
    `report-${fromDate}-to-${toDate}.pdf`
  );
}