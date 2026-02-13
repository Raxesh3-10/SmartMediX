import { useEffect, useMemo, useState } from "react";
import { PaymentAPI } from "../../api/api";
import "../../styles/Doctor.css"; // We will use the same classes here

const CACHE_DOCTOR_TRANSACTIONS = "cache_doctor_transactions";

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
  const [refreshing, setRefreshing] = useState(false);

const loadTransactions = async (force = false) => {
  try {
    setRefreshing(true);

    if (!force) {
      const cached = localStorage.getItem(CACHE_DOCTOR_TRANSACTIONS);
      if (cached) {
        setRows(JSON.parse(cached));
        setRefreshing(false);
        return;
      }
    }

    const res = await PaymentAPI.getMyTransactions();
    const data = res.data || [];

    setRows(data);
    localStorage.setItem(
      CACHE_DOCTOR_TRANSACTIONS,
      JSON.stringify(data)
    );
  } catch (err) {
    console.error("Transaction history error:", err);
  } finally {
    setRefreshing(false);
  }
};

useEffect(() => {
  loadTransactions();
}, []);

  /* ================= NORMALIZE ================= */
  const normalized = useMemo(() => {
    return rows
      .map(r => {
        if (r.transaction) {
          return {
            transaction: r.transaction,
            patientName: r.patientName || "Patient",
            patientEmail: r.patientEmail || "N/A",
          };
        }
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
    <div className="main-content">
      {/* EARNINGS SUMMARY CARD */}
      <div className="profile-box earnings-summary animate-fade-in">
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <span className="summary-label">Total Professional Earnings</span>
    <h2 className="total-amount">
      ₹{totalEarnings.toLocaleString("en-IN")}
    </h2>
  </div>

  <button
    className="refresh-btn"
    onClick={() => {
      localStorage.removeItem(CACHE_DOCTOR_TRANSACTIONS);
      loadTransactions(true);
    }}
    disabled={refreshing}
  >
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

        
        <input
          className="input-field"
          placeholder="Search by patient name, email, amount, or date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", marginTop: "15px", marginBottom: "0" }}
        />
      </div>

      {/* BILLING GROUPS */}
      <div className="billing-list-container">
        {Object.entries(grouped).length > 0 ? (
          Object.entries(grouped).map(([key, list]) => {
            const head = list[0];
            const open = expanded === key;

            return (
              <div key={key} className={`billing-group-box ${open ? "is-expanded" : ""}`}>
                {/* PATIENT HEADER */}
                <div
                  className="billing-group-header"
                  onClick={() => setExpanded(open ? null : key)}
                >
                  <div className="patient-meta">
                    <div className="patient-avatar">{head.patientName.charAt(0)}</div>
                    <div>
                      <strong>{head.patientName}</strong>
                      <div className="record-meta">{head.patientEmail}</div>
                    </div>
                  </div>
                  <div className="group-stats">
                    <span className="transaction-count">{list.length} Records</span>
                    <span className="expand-chevron">{open ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* TRANSACTIONS SUB-LIST */}
                {open && (
                  <div className="transaction-sublist animate-fade-in">
                    {list.map(x => {
                      const t = x.transaction;
                      return (
                        <div key={t.transactionId} className="billing-card-detail">
                          <div className="bill-row">
                            <span>Consultation Fee</span>
                            <span className="amount-val">₹{t.consultationFee}</span>
                          </div>
                          <div className="bill-row highlight">
                            <span>You Received</span>
                            <span className="amount-val green">₹{t.totalDoctorReceives}</span>
                          </div>
                          <div className="bill-footer">
                            <span>📅 {formatIST(t.paidAt)}</span>
                            <span className={`status-badge ${t.status?.toLowerCase()}`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="profile-box empty-msg">No transaction records found.</div>
        )}
      </div>
    </div>
  );
}