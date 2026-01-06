package com.eHealth.eHealth.appointment;

import java.time.Instant;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.eHealth.eHealth.model.Appointment;
import com.eHealth.eHealth.model.Doctor;
import com.eHealth.eHealth.repository.AppointmentRepository;
import com.eHealth.eHealth.repository.DoctorRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final JavaMailSender mailSender;

    public AppointmentService(AppointmentRepository appointmentRepo,
                              DoctorRepository doctorRepo,
                              JavaMailSender mailSender) {
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.mailSender = mailSender;
    }

    public Appointment createAppointment(Appointment appt) {

        Doctor doctor = doctorRepo.findById(appt.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        int token = (int) appointmentRepo
                .countByDoctorId(appt.getDoctorId()) + 1;

        appt.setTokenNumber(token);
        appt.setEstimatedWaitMinutes(token * 10);
        appt.setVideoRoomId("VIDEO_ROOM_" + appt.getAppointmentId());
        appt.setStatus("CONFIRMED");
        appt.setCreatedAt(Instant.now());

        Appointment saved = appointmentRepo.save(appt);
        sendDoctorEmail(doctor.getUserId(), saved);
        return saved;
    }

    private void sendDoctorEmail(String email, Appointment appt) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("New Appointment");
        msg.setText("Appointment scheduled at " + appt.getAppointmentTime());
        mailSender.send(msg);
    }
}