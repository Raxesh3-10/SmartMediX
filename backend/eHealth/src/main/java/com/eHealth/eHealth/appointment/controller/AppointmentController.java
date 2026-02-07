package com.eHealth.eHealth.appointment.controller;

import com.eHealth.eHealth.appointment.service.AppointmentService;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.model.Appointment;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment,
                              @RequestParam(required = false) String specialization) {
        return service.createAppointment(appointment, specialization);
    }

    @GetMapping("/aibot")
    public List<DoctorWithUserDTO> getDoctorForAIBot() {
        return service.getDoctorForAIBot();
    }

    @GetMapping("/patient/{patientId}")
    public List<Map<String, Object>> getPatientAppointments(@PathVariable String patientId) {
        return service.getPatientAppointments(patientId);
    }

    @PutMapping("/{appointmentId}")
    public Appointment updateAppointment(@PathVariable String appointmentId,@RequestBody Appointment updated) {
        return service.updateAppointment(appointmentId, updated);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Map<String, Object>> getDoctorAppointments(@PathVariable String doctorId) {
        return service.getDoctorAppointments(doctorId);
    }

    @GetMapping("/patient/{patientId}/doctors")
    public List<Map<String, Object>> getPatientDoctors(@PathVariable String patientId) {
        return service.getDoctorsByPatient(patientId);
    }

    @PostMapping("/{appointmentId}/complete")
    public void complete(@PathVariable String appointmentId) {
        service.completeAppointment(appointmentId);
    }
}