package com.eHealth.eHealth.admin.service.impl;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.stereotype.Service;
import com.eHealth.eHealth.enumRole.Role;
import com.eHealth.eHealth.admin.service.AdminService;
import com.eHealth.eHealth.dto.*;
import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.utility.JwtUtil;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;
    private final ChatRepository chatRepo;
    private final TransactionRepository txRepo;
    private final FamilyRepository familyRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepo;

    public AdminServiceImpl(UserRepository userRepo,
                            JwtSessionRepository jwtRepo,
                            ChatRepository chatRepo,
                            TransactionRepository txRepo,
                            FamilyRepository familyRepo ,
                            PatientRepository patientRepo,
                            DoctorRepository doctorRepo,
                            AppointmentRepository appointmentRepo) {
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
        this.chatRepo = chatRepo;
        this.txRepo = txRepo;
        this.familyRepo = familyRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
    }

    private void validateAdmin(String jwt) {
        if (!JwtUtil.isAdmin(jwt,userRepo,jwtRepo)) {
            throw new RuntimeException("ADMIN only");
        }
    }
@Override
public String createAdminUser(User user, String adminJwt) {
    validateAdmin(adminJwt);

    if (user.getRole() != Role.ADMIN) {
        throw new RuntimeException("Only ADMIN role can be created");
    }

    if (userRepo.findByEmail(user.getEmail()).isPresent()) {
        throw new RuntimeException("User already exists");
    }
    user.setRole(Role.ADMIN);
    // IMPORTANT: password must already be encoded by caller or auth service
    userRepo.save(user);
    return "ADMIN user created successfully";
}

@Override
public String updateUser(String id, User user, String adminJwt) {
    validateAdmin(adminJwt);

    return userRepo.findById(id).map(existing -> {

        // 🔒 ONLY these two fields are allowed
        existing.setName(user.getName());
        existing.setRole(Role.ADMIN);

        userRepo.save(existing);
        return "User updated successfully";

    }).orElseThrow(() -> new RuntimeException("User not found"));
}

@Override
public List<AdminUserFullView> getAllUsersFull(String adminJwt) {
    validateAdmin(adminJwt);

    return userRepo.findAll().stream().map(user -> {

        AdminUserFullView view = new AdminUserFullView();
        view.setUser(user);

        if (user.getRole() == Role.PATIENT) {

            patientRepo.findByUserId(user.getId()).ifPresent(patient -> {
                view.setPatient(patient);
                view.setAppointments(
                        appointmentRepo.findByPatientId(patient.getPatientId())
                );
                view.setTransactions(
                        txRepo.findByPatientId(patient.getPatientId())
                );
                familyRepo.findByOwnerPatientId(patient.getPatientId())
                        .ifPresent(view::setFamily);
            });

        } else if (user.getRole() == Role.DOCTOR) {

            doctorRepo.findByUserId(user.getId()).ifPresent(doctor -> {
                view.setDoctor(doctor);
                view.setAppointments(
                        appointmentRepo.findByDoctorId(doctor.getDoctorId())
                );
                view.setTransactions(
                        txRepo.findByDoctorId(doctor.getDoctorId())
                );
            });
        }

        return view;

    }).toList();
}

@Override
public String deleteUserFull(String userId, String adminJwt) {
    validateAdmin(adminJwt);

    User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    jwtRepo.deleteByEmail(user.getEmail());

    if (user.getRole() == Role.PATIENT) {

        patientRepo.findByUserId(userId).ifPresent(patient -> {

            appointmentRepo.deleteByPatientId(patient.getPatientId());
            txRepo.deleteByPatientId(patient.getPatientId());

            familyRepo.findByOwnerPatientId(patient.getPatientId())
                    .ifPresent(familyRepo::delete);

            patientRepo.delete(patient);
        });

    } else if (user.getRole() == Role.DOCTOR) {

        doctorRepo.findByUserId(userId).ifPresent(doctor -> {

            appointmentRepo.deleteByDoctorId(doctor.getDoctorId());
            txRepo.deleteByDoctorId(doctor.getDoctorId());

            doctorRepo.delete(doctor);
        });
    }

    userRepo.delete(user);
    return "User and related data deleted successfully";
}

    @Override
    public AdminDashboardStats getDashboardStats(String adminJwt) {
        validateAdmin(adminJwt);

        AdminDashboardStats stats = new AdminDashboardStats();
        stats.setTotalChatMessages(chatRepo.count());
        stats.setUserActivity(calculateUserActivity());
        stats.setEarnings(calculateEarnings());
        stats.setFamilyStats(calculateFamilyStats());

        return stats;
    }

    /* ================= USER ACTIVITY ================= */

    private UserActivityStats calculateUserActivity() {

        List<User> doctors = userRepo.findByRole(Role.DOCTOR);
        List<User> patients = userRepo.findByRole(Role.PATIENT);

        List<String> doctorEmails = doctors.stream().map(User::getEmail).toList();
        List<String> patientEmails = patients.stream().map(User::getEmail).toList();

        long activeDoctors = jwtRepo.countByEmailIn(doctorEmails);
        long activePatients = jwtRepo.countByEmailIn(patientEmails);

        UserActivityStats s = new UserActivityStats();
        s.setActiveDoctors(activeDoctors);
        s.setInactiveDoctors(doctors.size() - activeDoctors);
        s.setActivePatients(activePatients);
        s.setInactivePatients(patients.size() - activePatients);

        return s;
    }

    /* ================= EARNINGS ================= */

    private EarningsStats calculateEarnings() {

        EarningsStats e = new EarningsStats();

        List<Transaction> all =
                txRepo.findByStatusAndPaidAtAfter("SUCCESS", Instant.EPOCH);

        double total = all.stream()
                .mapToDouble(t -> t.getTotalPaidByPatient() - t.getTotalDoctorReceives())
                .sum();

        e.setTotal(total);
        e.setYearly(calcPeriodEarnings(all, startOfYear()));
        e.setMonthly(calcPeriodEarnings(all, startOfMonth()));
        e.setWeekly(calcPeriodEarnings(all, startOfWeek()));
        e.setDaily(calcPeriodEarnings(all, startOfDay()));

        e.setAvgYearly(total / Math.max(1, yearsSinceStart()));
        e.setAvgMonthly(total / Math.max(1, monthsSinceStart()));
        e.setAvgWeekly(total / Math.max(1, weeksSinceStart()));
        e.setAvgDaily(total / Math.max(1, daysSinceStart()));

        return e;
    }

    private double calcPeriodEarnings(List<Transaction> txs, Instant from) {
        return txs.stream()
                .filter(t -> t.getPaidAt() != null && t.getPaidAt().isAfter(from))
                .mapToDouble(t -> t.getTotalPaidByPatient() - t.getTotalDoctorReceives())
                .sum();
    }

    /* ================= FAMILY ================= */

    private TimeStats calculateFamilyStats() {

        TimeStats t = new TimeStats();

        t.setTotal(familyRepo.count());
        t.setYearly(familyRepo.countByCreatedAtAfter(startOfYear()));
        t.setMonthly(familyRepo.countByCreatedAtAfter(startOfMonth()));
        t.setWeekly(familyRepo.countByCreatedAtAfter(startOfWeek()));
        t.setDaily(familyRepo.countByCreatedAtAfter(startOfDay()));

        t.setAvgYearly((double) t.getTotal() / Math.max(1, yearsSinceStart()));
        t.setAvgMonthly((double) t.getTotal() / Math.max(1, monthsSinceStart()));
        t.setAvgWeekly((double) t.getTotal() / Math.max(1, weeksSinceStart()));
        t.setAvgDaily((double) t.getTotal() / Math.max(1, daysSinceStart()));

        return t;
    }

    /* ================= TIME HELPERS ================= */

    private Instant startOfYear() {
        return LocalDate.now(ZoneOffset.UTC)
                .with(TemporalAdjusters.firstDayOfYear())
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    private Instant startOfMonth() {
        return LocalDate.now(ZoneOffset.UTC)
                .with(TemporalAdjusters.firstDayOfMonth())
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    private Instant startOfWeek() {
        return LocalDate.now(ZoneOffset.UTC)
                .with(DayOfWeek.MONDAY)
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    private Instant startOfDay() {
        return LocalDate.now(ZoneOffset.UTC)
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    private long yearsSinceStart() {
        return Math.max(1,
                ChronoUnit.YEARS.getDuration().toDays() == 0 ? 1 :
                        ChronoUnit.YEARS.getDuration().toDays());
    }

    private long monthsSinceStart() {
        return Math.max(1,
                ChronoUnit.MONTHS.getDuration().toDays() == 0 ? 1 :
                        ChronoUnit.MONTHS.getDuration().toDays());
    }

    private long weeksSinceStart() {
        return Math.max(1,
                ChronoUnit.WEEKS.getDuration().toDays());
    }

    private long daysSinceStart() {
        return Math.max(1,
                ChronoUnit.DAYS.getDuration().toDays());
    }

}