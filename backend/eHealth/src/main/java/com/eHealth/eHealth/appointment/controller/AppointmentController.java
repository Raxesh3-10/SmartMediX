package com.eHealth.eHealth.appointment.controller;
import com.eHealth.eHealth.appointment.AppointmentService;
import com.eHealth.eHealth.model.Appointment;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        return service.createAppointment(appointment);
    }
}
