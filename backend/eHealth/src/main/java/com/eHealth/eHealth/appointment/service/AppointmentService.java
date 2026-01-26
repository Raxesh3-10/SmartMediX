package com.eHealth.eHealth.appointment.service;

import com.eHealth.eHealth.model.*;
import com.eHealth.eHealth.repository.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;
    private final UserRepository userRepo;
    private final JavaMailSender mailSender;
    private final FamilyRepository familyRepo;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            DoctorRepository doctorRepo,
            PatientRepository patientRepo,
            UserRepository userRepo,
            JavaMailSender mailSender,
            FamilyRepository familyRepo
    ) {
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
        this.userRepo = userRepo;
        this.familyRepo = familyRepo;
        this.mailSender = mailSender;
    }
    @Transactional
    public Appointment createAppointment(Appointment appt, String specialization) {
        if (appt.getDoctorId() == null && specialization != null) {
            Doctor aiDoctor = chooseDoctorByAI(specialization);
            appt.setDoctorId(aiDoctor.getDoctorId());
        }
        Doctor doctor = doctorRepo.findById(appt.getDoctorId()).orElseThrow(() -> new RuntimeException("Doctor not found"));
        boolean alreadyBooked =
                appointmentRepo.existsByDoctorIdAndDayAndStartTimeAndEndTimeAndStatusNot(appt.getDoctorId(),appt.getDay(),appt.getStartTime(),appt.getEndTime(),"CANCELLED"
                );
        if (alreadyBooked) 
            throw new RuntimeException("Slot already booked");
        appt.setStatus("CREATED");
        appt.setRoomId("ROOM_" + UUID.randomUUID());
        appt.setCreatedAt(Instant.now());
        Appointment saved = appointmentRepo.save(appt);
        markSlotAsBooked(doctor, saved);
        return saved;
    }
    private void markSlotAsBooked(Doctor doctor, Appointment appt) {
        List<AvailabilitySlot> updatedSlots = new ArrayList<>();
        for (AvailabilitySlot s : doctor.getSlots()) {
            if (s.getDay().equals(appt.getDay()) &&s.getStartTime().equals(appt.getStartTime()) &&s.getEndTime().equals(appt.getEndTime())) {
                if (s.isBooked()) 
                    throw new RuntimeException("Slot already booked");
                s.setBooked(true);
            }
            updatedSlots.add(s);
        }
        doctor.setSlots(updatedSlots);
        doctorRepo.save(doctor);
    }
    @Transactional
public Appointment updateAppointment(String appointmentId, Appointment updated) {
    Appointment appt = appointmentRepo.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found"));
    if ("COMPLETED".equals(appt.getStatus())) 
        throw new RuntimeException("Completed appointment cannot be modified");
    appt.setRoomId(updated.getRoomId());
    return appointmentRepo.save(appt);
}
@Transactional
    public List<Map<String, Object>> getDoctorAppointments(String doctorId) {
        List<Appointment> appointments =appointmentRepo.findByDoctorId(doctorId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment appt : appointments) {
            Patient patient = patientRepo.findById(appt.getPatientId()).orElse(null);
            User user = (patient != null) ? userRepo.findById(patient.getUserId()).orElse(null) : null;
            Map<String, Object> map = new HashMap<>();
            map.put("appointment", appt);
            map.put("patient", patient);
            map.put("user", user);
            result.add(map);
        }
        return result;
    }
    @Transactional
    public List<Map<String, Object>> getDoctorsByPatient(String patientId) {
        List<Appointment> appointments = appointmentRepo.findByPatientId(patientId);
        Set<String> doctorIds = new HashSet<>();
        for (Appointment a : appointments) 
            doctorIds.add(a.getDoctorId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (String doctorId : doctorIds) {
            Doctor doctor = doctorRepo.findById(doctorId).orElse(null);
            if (doctor == null) continue;
            User user = userRepo.findById(doctor.getUserId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("doctor", doctor);
            map.put("user", user);
            map.put("slots", doctor.getSlots());
            result.add(map);
        }
        return result;
    }
    @Transactional
    public void completeAppointment(String appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("COMPLETED");
        appointmentRepo.save(appt);
    }
    private Doctor chooseDoctorByAI(String specialization) {
        return doctorRepo.findAll().stream().filter(d ->d.getSpecialization().equalsIgnoreCase(specialization))
                .min(Comparator.comparing(d ->
                        appointmentRepo
                                .findByDoctorId(d.getDoctorId())
                                .size()))
                .orElseThrow(() ->
                        new RuntimeException(
                                "No doctor found for specialization"));
    }
    @Transactional
public List<Map<String, Object>> getPatientAppointments(String patientId) {
    List<Map<String, Object>> result = new ArrayList<>();
    Set<String> patientIds = new HashSet<>();
    patientIds.add(patientId);
    Family family = familyRepo.findByOwnerPatientId(patientId).orElse(null);
    if (family != null && family.getMembers() != null) 
        for (FamilyMember member : family.getMembers()) 
            patientIds.add(member.getPatientId());
    List<Appointment> appointments =appointmentRepo.findByPatientIdIn(new ArrayList<>(patientIds));
    for (Appointment appt : appointments) {
        Doctor doctor = doctorRepo.findById(appt.getDoctorId()).orElse(null);
        User user = (doctor != null) ? userRepo.findById(doctor.getUserId()).orElse(null): null;
        Map<String, Object> map = new HashMap<>();
        map.put("appointment", appt);
        map.put("doctor", doctor);
        map.put("user", user);
        boolean isSelf = appt.getPatientId().equals(patientId);
        map.put("isPrimaryPatient", isSelf);
        if (!isSelf && family != null) {
            family.getMembers().stream()
                    .filter(m -> m.getPatientId().equals(appt.getPatientId()))
                    .findFirst()
                    .ifPresent(member -> {
                        map.put("relation", member.getRelation());
                        map.put("familyMemberPatientId", member.getPatientId());
                        map.put("familyPatientUser", userRepo.findById(member.getPatientId()).orElse(null));
                    });
        }
        result.add(map);
    }
    return result;
}
    public void notifyDoctor(Doctor doctor, Appointment appt) {
        User user = userRepo.findById(doctor.getUserId()).orElseThrow();
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("New Appointment Confirmed");
        msg.setText(
                "Appointment on " + appt.getDay() +
                " at " + appt.getStartTime()
        );
        mailSender.send(msg);
    }
}