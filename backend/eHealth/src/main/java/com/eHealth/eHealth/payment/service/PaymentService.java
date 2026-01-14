package com.eHealth.eHealth.payment.service;

import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import com.eHealth.eHealth.appointment.service.AppointmentService;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final BillRepository billRepo;
    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final AppointmentService appointmentService;

    public PaymentService(PaymentRepository paymentRepo,
                          BillRepository billRepo,
                          AppointmentRepository appointmentRepo,
                          DoctorRepository doctorRepo,
                          AppointmentService appointmentService) {
        this.paymentRepo = paymentRepo;
        this.billRepo = billRepo;
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.appointmentService = appointmentService;
    }

    /**
     * One-click UPI test payment
     */
    public Payment processPayment(String appointmentId) {

        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = doctorRepo.findById(appt.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Payment payment = new Payment();
        payment.setAppointmentId(appointmentId);
        payment.setPatientId(appt.getPatientId());
        payment.setAmount(doctor.getConsultationFee());
        payment.setStatus("SUCCESS");
        payment.setPaidAt(Instant.now());

        Payment saved = paymentRepo.save(payment);

        appt.setStatus("PAID");
        appointmentRepo.save(appt);

        generateBill(saved, doctor);
        appointmentService.notifyDoctor(doctor, appt);

        return saved;
    }

    /**
     * Bill generation (NO TAX)
     */
    private void generateBill(Payment payment, Doctor doctor) {

        Bill bill = new Bill();
        bill.setPaymentId(payment.getPaymentId());
        bill.setAppointmentId(payment.getAppointmentId());
        bill.setPatientId(payment.getPatientId());
        bill.setDoctorId(doctor.getDoctorId());

        bill.setConsultationFee(payment.getAmount());
        bill.setTotalAmount(payment.getAmount());
        bill.setGeneratedAt(Instant.now());

        billRepo.save(bill);
    }
}