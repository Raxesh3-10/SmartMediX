import { useState } from "react";
import { generateDoctorPDF } from "../utils/generateDoctorPDF";

/* ================= DATE HELPERS ================= */

const todayISO = () => new Date().toISOString().split("T")[0];

const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const startOfWeek = (iso) => {
  const d = new Date(iso);
  const day = d.getDay() || 7; // Monday start
  d.setDate(d.getDate() - (day - 1));
  return d.toISOString().split("T")[0];
};

const endOfWeek = (iso) => addDays(startOfWeek(iso), 6);

const startOfMonth = (iso) => {
  const d = new Date(iso);
  d.setDate(1);
  return d.toISOString().split("T")[0];
};

const endOfMonth = (iso) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + 1, 0);
  return d.toISOString().split("T")[0];
};

const startOfYear = (year) => `${year}-01-01`;
const endOfYear = (year) => `${year}-12-31`;

/* ================= COMPONENT ================= */

export default function DoctorPdfReport({ doctor, user }) {
  const today = todayISO();

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  /* ================= PRESET HANDLERS ================= */

  const yesterday = () => {
    const y = addDays(today, -1);
    setFromDate(y);
    setToDate(y);
  };

  const currentWeek = () => {
    setFromDate(startOfWeek(today));
    setToDate(endOfWeek(today));
  };

  const previousWeek = () => {
    const d = addDays(today, -7);
    setFromDate(startOfWeek(d));
    setToDate(endOfWeek(d));
  };

  const currentMonth = () => {
    setFromDate(startOfMonth(today));
    setToDate(endOfMonth(today));
  };

  const previousMonth = () => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 1);
    const iso = d.toISOString().split("T")[0];
    setFromDate(startOfMonth(iso));
    setToDate(endOfMonth(iso));
  };

  const currentYear = () => {
    const y = new Date().getFullYear();
    setFromDate(startOfYear(y));
    setToDate(endOfYear(y));
  };

  const previousYear = () => {
    const y = new Date().getFullYear() - 1;
    setFromDate(startOfYear(y));
    setToDate(endOfYear(y));
  };

  /* ================= SUBMIT ================= */

  const generate = async () => {
    if (!doctor || !user) {
      alert("Doctor profile not loaded");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be after To date");
      return;
    }

    await generateDoctorPDF({
      doctorId: doctor.doctorId,
      doctorName: user.name,
      fromDate,
      toDate,
    });
  };

  /* ================= UI ================= */

  return (
    <div className="profile-box animate-fade-in">
      <h3>Download Earnings and Report PDF</h3>

      {/* DATE INPUTS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
        <input
          type="date"
          className="input-field"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="input-field"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* PRESETS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button className="secondary-btn" onClick={yesterday}>
          Yesterday
        </button>
        <button className="secondary-btn" onClick={currentWeek}>
          Current Week
        </button>
        <button className="secondary-btn" onClick={previousWeek}>
          Previous Week
        </button>
        <button className="secondary-btn" onClick={currentMonth}>
          Current Month
        </button>
        <button className="secondary-btn" onClick={previousMonth}>
          Previous Month
        </button>
        <button className="secondary-btn" onClick={currentYear}>
          Current Year
        </button>
        <button className="secondary-btn" onClick={previousYear}>
          Previous Year
        </button>
      </div>

      {/* SUBMIT */}
      <button
        className="primary-btn"
        style={{ width: "100%" }}
        onClick={generate}
      >
        Generate PDF Report
      </button>
    </div>
  );
}