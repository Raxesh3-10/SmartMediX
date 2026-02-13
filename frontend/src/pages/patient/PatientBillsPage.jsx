import { useEffect, useMemo, useState } from "react";
import { PaymentAPI } from "../../api/api";
import "../../styles/Patient.css";

const CACHE_PATIENT_TRANSACTIONS = "cache_patient_transactions";

const formatIST = (isoDate) =>
  new Date(isoDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function PatientBillsPage() {
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

const loadTransactions = async (force = false) => {
  try {
    setRefreshing(true);

    if (!force) {
      const cached = localStorage.getItem(CACHE_PATIENT_TRANSACTIONS);
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
      CACHE_PATIENT_TRANSACTIONS,
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
            doctorName: r.doctorName || "Doctor",
            doctorEmail: r.doctorEmail || "N/A",
          };
        }
        return {
          transaction: r,
          doctorName: "Doctor",
          doctorEmail: r.doctorId || "N/A",
        };
      })
      .filter(x => x.transaction)
      .sort((a, b) => new Date(b.transaction.paidAt) - new Date(a.transaction.paidAt));
  }, [rows]);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    if (!search) return normalized;
    const q = search.toLowerCase();
    return normalized.filter(x => {
      const t = x.transaction;
      return (
        x.doctorName.toLowerCase().includes(q) ||
        x.doctorEmail.toLowerCase().includes(q) ||
        String(t.totalPaidByPatient).includes(q) ||
        formatIST(t.paidAt).toLowerCase().includes(q)
      );
    });
  }, [normalized, search]);

  const totalBills = useMemo(() => {
    return filtered.reduce((sum, x) => sum + (x.transaction.totalPaidByPatient || 0), 0);
  }, [filtered]);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(x => {
      const key = x.doctorEmail;
      if (!map[key]) map[key] = [];
      map[key].push(x);
    });
    return map;
  }, [filtered]);

  return (
    <main className="main-content">
      {/* SUMMARY STAT CARD */}
      <div className="profile-box bill-summary-card">
        <div className="summary-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <span className="summary-label">Total Expenditure</span>
    <h2 className="summary-amount money-highlight">
      ₹{totalBills.toLocaleString("en-IN")}
    </h2>
  </div>

  <button
    className="refresh-btn"
    disabled={refreshing}
    onClick={() => {
      localStorage.removeItem(CACHE_PATIENT_TRANSACTIONS);
      loadTransactions(true);
    }}
  >
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

          {/* Added "money-highlight" class here */}
          <h2 className="summary-amount money-highlight">
            ₹{totalBills.toLocaleString("en-IN")}
          </h2>
        </div>
      <div className="summary-icon">🧾</div>
      </div>

      <div className="profile-box">
        <h3>Transaction History</h3>
        <input
          className="input-field"
          placeholder="Search by doctor, email, amount, or date..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="bill-groups-container">
          {Object.entries(grouped).length > 0 ? (
            Object.entries(grouped).map(([key, list]) => {
              const head = list[0];
              const open = expanded === key;

              return (
                <div key={key} className={`bill-group ${open ? "is-open" : ""}`}>
                  {/* DOCTOR HEADER */}
                  <div
                    className="bill-group-header"
                    onClick={() => setExpanded(open ? null : key)}
                  >
                    <div className="bill-doc-info">
                      <strong>Dr. {head.doctorName}</strong>
                      <div className="doctor-subtext">{head.doctorEmail}</div>
                    </div>
                    <div className="bill-group-meta">
                      <span className="bill-count">{list.length} Bills</span>
                      <span className="expand-chevron">{open ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* TRANSACTIONS LIST */}
                  {open && (
                    <div className="bill-details-list">
                      {list.map(x => {
                        const t = x.transaction;
                        return (
                          <div key={t.transactionId} className="bill-item-row">
                            <div className="bill-main">
                              <span className="bill-amt">₹{t.totalPaidByPatient}</span>
                              <span className="bill-date">{formatIST(t.paidAt)}</span>
                            </div>
                            <div className="bill-status">
                              <span className={`status-pill ${t.status?.toLowerCase()}`}>
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
            <div className="empty-state">No transactions found matching your search.</div>
          )}
        </div>
      </div>
    </main>
  );
}