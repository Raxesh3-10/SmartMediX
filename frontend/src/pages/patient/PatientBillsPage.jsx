import { useEffect, useState } from "react";
import { PatientBillingAPI } from "../../api/api";

export default function PatientBillsPage() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    PatientBillingAPI.getMyBillingHistory()
      .then((res) => setBills(res.data));
  }, []);

  return (
    <div style={styles.page}>
      <h3>My Bills</h3>

      {bills.map((b, i) => (
        <div key={i} style={styles.card}>
          <div>
            Amount: ₹{b.bill.totalAmount}
          </div>
          <div style={styles.sub}>
            {b.payment.status}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: 20 },
  card: {
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  sub: { fontSize: 12, color: "#64748b" },
};