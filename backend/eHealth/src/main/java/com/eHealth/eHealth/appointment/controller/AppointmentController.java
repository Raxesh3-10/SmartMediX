package com.eHealth.eHealth.appointment.controller;

import com.eHealth.eHealth.appointment.service.AppointmentService;
import com.eHealth.eHealth.model.Appointment;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    /**
     * Create appointment (manual OR AI)
     */
    @PostMapping
    public Appointment create(@RequestBody Appointment appointment,
                              @RequestParam(required = false) String specialization) {
        return service.createAppointment(appointment, specialization);
    }
/**
 * Patient dashboard – see appointments
 */
@GetMapping("/patient/{patientId}")
public List<Map<String, Object>> getPatientAppointments(
        @PathVariable String patientId) {

    return service.getPatientAppointments(patientId);
}

    /**
     * Update appointment (reschedule)
     * - NO re-payment
     */
    @PutMapping("/{appointmentId}")
    public Appointment updateAppointment(
            @PathVariable String appointmentId,
            @RequestBody Appointment updated) {

        return service.updateAppointment(appointmentId, updated);
    }

    /**
     * Doctor dashboard – see appointments
     */
    @GetMapping("/doctor/{doctorId}")
    public List<Map<String, Object>> getDoctorAppointments(
            @PathVariable String doctorId) {

        return service.getDoctorAppointments(doctorId);
    }

    /**
     * Patient → get associated doctors + user info
     */
    @GetMapping("/patient/{patientId}/doctors")
    public List<Map<String, Object>> getPatientDoctors(
            @PathVariable String patientId) {

        return service.getDoctorsByPatient(patientId);
    }

    /**
     * Complete appointment
     */
    @PostMapping("/{appointmentId}/complete")
    public void complete(@PathVariable String appointmentId) {
        service.completeAppointment(appointmentId);
    }
}