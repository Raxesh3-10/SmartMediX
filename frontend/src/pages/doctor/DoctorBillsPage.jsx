import { useEffect, useMemo, useState } from "react";
import { PaymentAPI } from "../../api/api";

const formatIST = (isoDate) =>
  new Date(isoDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function DoctorBillsPage() {
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    PaymentAPI.getMyTransactions()
      .then(res => setRows(res.data || []))
      .catch(err =>
        console.error("Transaction history error:", err)
      );
  }, []);

  /* ================= NORMALIZE ================= */
  const normalized = useMemo(() => {
    return rows
      .map(r => {
        // DTO case (recommended)
        if (r.transaction) {
          return {
            transaction: r.transaction,
            patientName: r.patientName || "Patient",
            patientEmail: r.patientEmail || "N/A",
          };
        }

        // Raw Transaction fallback
        return {
          transaction: r,
          patientName: "Patient",
          patientEmail: r.patientId || "N/A",
        };
      })
      .filter(x => x.transaction)
      .sort(
        (a, b) =>
          new Date(b.transaction.paidAt) -
          new Date(a.transaction.paidAt)
      );
  }, [rows]);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    if (!search) return normalized;
    const q = search.toLowerCase();

    return normalized.filter(x => {
      const t = x.transaction;
      return (
        x.patientName.toLowerCase().includes(q) ||
        x.patientEmail.toLowerCase().includes(q) ||
        String(t.totalDoctorReceives).includes(q) ||
        formatIST(t.paidAt).toLowerCase().includes(q)
      );
    });
  }, [normalized, search]);
const totalEarnings = useMemo(() => {
  return filtered.reduce(
    (sum, x) => sum + (x.transaction.totalDoctorReceives || 0),
    0
  );
}, [filtered]);

  /* ================= GROUP BY PATIENT ================= */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(x => {
      const key = x.patientEmail;
      if (!map[key]) map[key] = [];
      map[key].push(x);
    });
    return map;
  }, [filtered]);

  return (
    <div style={styles.page}>
    <h3>
        My Earnings : ₹{totalEarnings.toLocaleString("en-IN")}
    </h3>


      <input
        placeholder="Search by patient, email, amount, or time"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      {Object.entries(grouped).map(([key, list]) => {
        const head = list[0];
        const open = expanded === key;

        return (
          <div key={key} style={styles.group}>
            {/* PATIENT HEADER */}
            <div
              style={styles.groupHeader}
              onClick={() => setExpanded(open ? null : key)}
            >
              <div>
                <strong>{head.patientName}</strong>
                <div style={styles.sub}>{head.patientEmail}</div>
              </div>
              <div>{open ? "▲" : "▼"}</div>
            </div>

            {/* TRANSACTIONS */}
            {open &&
              list.map(x => {
                const t = x.transaction;
                return (
                  <div
                    key={t.transactionId}
                    style={styles.card}
                  >
                    <div>
                      <strong>Consultation Fee:</strong> ₹
                      {t.consultationFee}
                    </div>

                    <div>
                      <strong>You Receive:</strong> ₹
                      {t.totalDoctorReceives}
                    </div>

                    <div>
                      <strong>Paid At:</strong>{" "}
                      {formatIST(t.paidAt)}
                    </div>

                    <div>
                      <strong>Status:</strong> {t.status}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 20,
    maxWidth: 800,
  },
  search: {
    width: "100%",
    padding: 8,
    marginBottom: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
  },
  group: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    marginBottom: 12,
  },
  groupHeader: {
    padding: 12,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    background: "#f8fafc",
  },
  card: {
    padding: 12,
    borderTop: "1px solid #e5e7eb",
  },
  sub: {
    fontSize: 12,
    color: "#64748b",
  },
};
