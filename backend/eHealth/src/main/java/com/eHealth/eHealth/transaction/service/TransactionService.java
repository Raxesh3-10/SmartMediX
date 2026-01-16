package com.eHealth.eHealth.transaction.service;

import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.dto.TransactionHistoryResponse;
import com.eHealth.eHealth.utility.JwtUtil;
import com.eHealth.eHealth.appointment.service.AppointmentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final double PLATFORM_PERCENT = 0.0;

    private final TransactionRepository transactionRepo;
    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final AppointmentService appointmentService;
    private final UserRepository userRepo;
    private final JwtSessionRepository jwtRepo;
    private final PatientRepository patientRepo;

    public TransactionService(TransactionRepository transactionRepo,
                              AppointmentRepository appointmentRepo,
                              DoctorRepository doctorRepo,
                              AppointmentService appointmentService,
                              UserRepository userRepo,
                              JwtSessionRepository jwtRepo,
                              PatientRepository patientRepo) {
        this.transactionRepo = transactionRepo;
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.appointmentService = appointmentService;
        this.userRepo = userRepo;
        this.jwtRepo = jwtRepo;
        this.patientRepo = patientRepo;
    }

    /* ================= PAYMENT ================= */

    public Transaction processTransaction(String appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = doctorRepo.findById(appt.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        double fee = doctor.getConsultationFee();
        double patientFee = fee * PLATFORM_PERCENT;
        double doctorFee = fee * PLATFORM_PERCENT;

        Transaction tx = new Transaction();
        tx.setAppointmentId(appt.getAppointmentId());
        tx.setPatientId(appt.getPatientId());
        tx.setDoctorId(doctor.getDoctorId());

        tx.setConsultationFee(fee);
        tx.setPatientPlatformFee(patientFee);
        tx.setDoctorPlatformFee(doctorFee);
        tx.setTax(0.0);

        tx.setTotalPaidByPatient(fee + patientFee);
        tx.setTotalDoctorReceives(fee - doctorFee);

        tx.setStatus("SUCCESS");
        tx.setPaidAt(java.time.Instant.now());
        tx.setCreatedAt(java.time.Instant.now());

        Transaction saved = transactionRepo.save(tx);

        appt.setStatus("PAID");
        appointmentRepo.save(appt);

        appointmentService.notifyDoctor(doctor, appt);

        return saved;
    }

    /* ================= HISTORY ================= */

    public List<TransactionHistoryResponse> getMyTransactions(String jwt) {

        List<Transaction> transactions;

        if (JwtUtil.isPatient(jwt, userRepo, jwtRepo)) {
            String userId = JwtUtil.getUserId(jwt, userRepo, jwtRepo);
            Patient patient = patientRepo.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));

            transactions = transactionRepo.findByPatientId(patient.getPatientId());

        } else if (JwtUtil.isDoctor(jwt, userRepo, jwtRepo)) {
            String userId = JwtUtil.getUserId(jwt, userRepo, jwtRepo);
            Doctor doctor = doctorRepo.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

            transactions = transactionRepo.findByDoctorId(doctor.getDoctorId());

        } else {
            throw new RuntimeException("Unauthorized access");
        }
        return transactions.stream().map(tx -> {
            User doctorUser = userRepo.findById(
                    doctorRepo.findById(tx.getDoctorId())
                            .orElseThrow(() -> new RuntimeException("Doctor not found"))
                            .getUserId()
            ).orElseThrow(() -> new RuntimeException("User not found"));
            User patientUser = userRepo.findById(
                    patientRepo.findById(tx.getPatientId())
                            .orElseThrow(() -> new RuntimeException("Patient not found"))
                            .getUserId()
            ).orElseThrow(() -> new RuntimeException("User not found"));
            return new TransactionHistoryResponse(tx, doctorUser,patientUser);
        }).collect(Collectors.toList());
    }
}