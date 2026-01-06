package com.eHealth.eHealth.payment;

import java.time.Instant;

import org.springframework.stereotype.Service;

import com.eHealth.eHealth.model.Bill;
import com.eHealth.eHealth.model.Payment;
import com.eHealth.eHealth.repository.BillRepository;
import com.eHealth.eHealth.repository.PaymentRepository;

@Service
public class UpiPaymentService {

    private final PaymentRepository paymentRepo;
    private final BillRepository billRepo;

    public UpiPaymentService(PaymentRepository paymentRepo,
                             BillRepository billRepo) {
        this.paymentRepo = paymentRepo;
        this.billRepo = billRepo;
    }

    public Payment processUpiPayment(String appointmentId,
                                     String patientId,
                                     double amount) {

        Payment payment = new Payment();
        payment.setAppointmentId(appointmentId);
        payment.setPatientId(patientId);
        payment.setAmount(amount);
        payment.setStatus("SUCCESS");
        payment.setPaidAt(Instant.now());

        Payment saved = paymentRepo.save(payment);
        generateBill(saved);
        return saved;
    }

    private void generateBill(Payment payment) {
        Bill bill = new Bill();
        bill.setPaymentId(payment.getPaymentId());
        bill.setAppointmentId(payment.getAppointmentId());
        bill.setPatientId(payment.getPatientId());
        bill.setConsultationFee(payment.getAmount());
        bill.setTax(payment.getAmount() * 0.05);
        bill.setTotalAmount(payment.getAmount() * 1.05);
        bill.setGeneratedAt(Instant.now());
        billRepo.save(bill);
    }
}
