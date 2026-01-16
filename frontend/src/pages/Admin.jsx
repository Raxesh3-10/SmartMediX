import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAPI, AuthAPI } from "../api/api";

function Admin() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  /* ================= FAMILY SEARCH ================= */
const [familySearch, setFamilySearch] = useState("");


  /* ================= ADMIN CRUD ================= */
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* ================= SEARCH ================= */
  const [userSearch, setUserSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!localStorage.getItem("JWT")) navigate("/login");
  }, [navigate]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          AdminAPI.getDashboardStats(),
          AdminAPI.getAllUsersFull(),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (e) {
        console.error("Admin load failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    await AuthAPI.logout();
    localStorage.clear();
    navigate("/login");
  };

  /* ================= ADMIN CRUD ================= */
  const createAdmin = async () => {
    await AdminAPI.createAdminUser({ ...adminForm, role: "ADMIN" });
    alert("Admin created");
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user and all related data?")) return;
    await AdminAPI.deleteUserFull(id);
    setUsers(users.filter(u => u.user.id !== id));
  };

  /* ================= HELPERS ================= */
  const normalize = v => v.trim().toLowerCase();

  /* ================= USER SEARCH ================= */
  const filteredUsers = useMemo(() => {
    if (!userSearch) return [];
    const q = normalize(userSearch);
    return users.filter(u =>
      normalize(u.user.name).includes(q) ||
      normalize(u.user.email).includes(q)
    );
  }, [userSearch, users]);

/* ================= FAMILY SEARCH ================= */
const familyMatch = useMemo(() => {
  if (!familySearch) return null;
  const q = normalize(familySearch);

  return users.find(u =>
    u.patient &&
    u.family &&
    (
      normalize(u.user.name).includes(q) ||
      normalize(u.user.email).includes(q)
    )
  ) || null;
}, [familySearch, users]);

const resolvePatientUser = (patientId) => {
  const entry = users.find(u => u.patient?.patientId === patientId);
  if (!entry) return null;

  return {
    user: entry.user,
    patient: entry.patient,
  };
};


  /* ================= APPOINTMENT / TRANSACTION SEARCH ================= */
  const patientMatch = useMemo(() => {
    if (!patientSearch) return null;
    const q = normalize(patientSearch);
    return users.find(
      u => u.patient &&
        (normalize(u.user.name).includes(q) ||
         normalize(u.user.email).includes(q))
    );
  }, [patientSearch, users]);

  const doctorMatch = useMemo(() => {
    if (!doctorSearch) return null;
    const q = normalize(doctorSearch);
    return users.find(
      u => u.doctor &&
        (normalize(u.user.name).includes(q) ||
         normalize(u.user.email).includes(q))
    );
  }, [doctorSearch, users]);

  const appointments = useMemo(() => {
    if (patientMatch && doctorMatch) {
      return patientMatch.appointments.filter(
        a => a.doctorId === doctorMatch.doctor.doctorId
      );
    }
    if (patientMatch) return patientMatch.appointments || [];
    if (doctorMatch) return doctorMatch.appointments || [];
    return [];
  }, [patientMatch, doctorMatch]);

  const transactions = useMemo(() => {
    if (patientMatch && doctorMatch) {
      return patientMatch.transactions.filter(
        t => t.doctorId === doctorMatch.doctor.doctorId
      );
    }
    if (patientMatch) return patientMatch.transactions || [];
    if (doctorMatch) return doctorMatch.transactions || [];
    return [];
  }, [patientMatch, doctorMatch]);

  if (loading) return <h3 style={styles.center}>Loading admin dashboard...</h3>;
  if (!stats) return <h3 style={styles.center}>Failed to load data</h3>;

  const { userActivity, earnings, familyStats } = stats;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </header>

      {/* ================= DASHBOARD STATS ================= */}
      <div style={styles.grid}>
        <StatCard title="Total Chat Messages" value={stats.totalChatMessages} />
        <StatCard title="Total Families" value={familyStats.total} />
        <StatCard
          title="Total Website Earnings"
          value={`₹ ${earnings.total.toFixed(2)}`}
        />
      </div>

      {/* ================= USER ACTIVITY ================= */}
      <Section title="User Activity">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Active</th>
              <th style={styles.th}>Inactive</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Doctors</td>
              <td style={styles.td}>{userActivity.activeDoctors}</td>
              <td style={styles.td}>{userActivity.inactiveDoctors}</td>
            </tr>
            <tr>
              <td style={styles.td}>Patients</td>
              <td style={styles.td}>{userActivity.activePatients}</td>
              <td style={styles.td}>{userActivity.inactivePatients}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ================= EARNINGS ================= */}
      <Section title="Website Earnings">
        <StatsTable
          currency
          rows={[
            ["Today", earnings.daily, earnings.avgDaily],
            ["This Week", earnings.weekly, earnings.avgWeekly],
            ["This Month", earnings.monthly, earnings.avgMonthly],
            ["This Year", earnings.yearly, earnings.avgYearly],
          ]}
        />
      </Section>

      {/* ================= FAMILY STATS ================= */}
      <Section title="Family Statistics">
        <StatsTable
          rows={[
            ["Today", familyStats.daily, familyStats.avgDaily],
            ["This Week", familyStats.weekly, familyStats.avgWeekly],
            ["This Month", familyStats.monthly, familyStats.avgMonthly],
            ["This Year", familyStats.yearly, familyStats.avgYearly],
          ]}
        />
      </Section>

      {/* ================= CREATE ADMIN ================= */}
      <Section title="Create Admin User">
        <div style={styles.formRow}>
          <input placeholder="Name" onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} />
          <input placeholder="Email" onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
          <button onClick={createAdmin}>Create Admin</button>
        </div>
      </Section>

      {/* ================= USER SEARCH ================= */}
<Section title="Search User">
  <input
    placeholder="Search by name or email"
    value={userSearch}
    onChange={e => setUserSearch(e.target.value)}
  />

  {filteredUsers.map(u => (
    <div key={u.user.id} style={styles.userCard}>
      <div>
        <b>{u.user.name}</b>
        <div style={styles.muted}>{u.user.email}</div>
        <span style={styles.role}>{u.user.role}</span>

        {/* ================= PATIENT DETAILS ================= */}
        {u.user.role === "PATIENT" && u.patient && (
          <div style={{ marginTop: 6 }}>
            <div style={styles.muted}>patientId: {u.patient.patientId}</div>
            <div style={styles.muted}>familyId: {u.patient.familyId}</div>
            <div style={styles.muted}>age: {u.patient.age}</div>
            <div style={styles.muted}>gender: {u.patient.gender}</div>
            <div style={styles.muted}>mobile: {u.patient.mobile}</div>
          </div>
        )}

        {/* ================= DOCTOR DETAILS ================= */}
        {u.user.role === "DOCTOR" && u.doctor && (
          <div style={{ marginTop: 6 }}>
            <div style={styles.muted}>doctorId: {u.doctor.doctorId}</div>
            <div style={styles.muted}>upi: {u.doctor.upi}</div>
            <div style={styles.muted}>
              specialization: {u.doctor.specialization}
            </div>
            <div style={styles.muted}>
              experienceYears: {u.doctor.experienceYears}
            </div>
            <div style={styles.muted}>
              consultationFee: ₹{u.doctor.consultationFee}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => deleteUser(u.user.id)}
        style={styles.danger}
      >
        Delete
      </button>
    </div>
  ))}
</Section>

{/* ================= FAMILY SEARCH ================= */}
<Section title="Find Family by Patient">
  <input
    placeholder="Patient name or email"
    value={familySearch}
    onChange={e => setFamilySearch(e.target.value)}
  />

{familyMatch && (
  <div style={{ marginTop: 16 }}>
    <h4>Family Members</h4>

    {familyMatch?.family.members?.map((m, idx) => {
      const resolved = resolvePatientUser(m.patientId);

      if (!resolved) {
        return (
          <div key={idx} style={styles.userCard}>
            <div>
              <b>Unknown Patient</b>
              <div style={styles.muted}>Patient ID: {m.patientId}</div>
            </div>
          </div>
        );
      }

      return (
        <div key={idx} style={styles.userCard}>
          <div>
            <b>{resolved.user.name}</b>
            <div style={styles.muted}>{resolved.user.email}</div>

            <div style={{ marginTop: 6 }}>
              <span style={styles.role}>
                {m.relation.toUpperCase()}
              </span>
              {m.primary && (
                <span style={{ ...styles.role, background: "#dcfce7", marginLeft: 6 }}>
                  PRIMARY
                </span>
              )}
            </div>
          </div>

          <div style={styles.muted}>
            Patient ID: {resolved.patient.patientId}
          </div>
        </div>
      );
    })}
  </div>
)}


  {familySearch && !familyMatch && (
    <p style={styles.muted}>No family found for this patient</p>
  )}
</Section>

      {/* ================= APPOINTMENTS & TRANSACTIONS ================= */}
      <Section title="Appointments & Transactions">
        <div style={styles.searchGrid}>
          <input
            placeholder="Patient name or email"
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
          />
          <input
            placeholder="Doctor name or email"
            value={doctorSearch}
            onChange={e => setDoctorSearch(e.target.value)}
          />
        </div>

        {(patientMatch || doctorMatch) && (
          <>
            <h4>Appointments</h4>
            <pre>{JSON.stringify(appointments, null, 2)}</pre>

            <h4>Transactions</h4>
            <pre>{JSON.stringify(transactions, null, 2)}</pre>
          </>
        )}
      </Section>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ title, value }) => (
  <div style={styles.card}>
    <h4>{title}</h4>
    <p style={styles.big}>{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section style={styles.section}>
    <h3>{title}</h3>
    {children}
  </section>
);

const StatsTable = ({ rows, currency }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Period</th>
        <th style={styles.th}>Total</th>
        <th style={styles.th}>Average</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([label, total, avg]) => (
        <tr key={label}>
          <td style={styles.td}>{label}</td>
          <td style={styles.td}>
            {currency ? `₹ ${total.toFixed(2)}` : total}
          </td>
          <td style={styles.td}>
            {currency ? `₹ ${avg.toFixed(2)}` : avg}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ================= STYLES ================= */

const styles = {
  page: { padding: 32, background: "#f9fafb" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 24 },
  logout: { background: "#b91c1c", color: "#fff", border: "none", padding: "8px 14px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 },
  card: { background: "#fff", padding: 16, marginTop: 12, border: "1px solid #ddd" },
  big: { fontSize: 24, fontWeight: "bold" },

  section: { background: "#fff", padding: 24, marginBottom: 32, borderRadius: 6 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16, border: "1px solid #e5e7eb" },
  th: { border: "1px solid #e5e7eb", padding: 12, background: "#f3f4f6" },
  td: { border: "1px solid #e5e7eb", padding: 12 },

  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 },
  searchGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "#f9fafb",
  },

  role: {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 8px",
    fontSize: 12,
    background: "#e0e7ff",
    borderRadius: 12,
  },

  danger: { background: "#dc2626", color: "#fff", border: "none", padding: "6px 10px" },
  muted: { fontSize: 13, color: "#6b7280" },
  center: { textAlign: "center", marginTop: 80 },
};

export default Admin;