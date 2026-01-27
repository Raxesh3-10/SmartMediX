package com.eHealth.eHealth.doctor.service;

import java.util.List;

import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.model.Doctor;
import jakarta.servlet.http.HttpServletRequest;

public interface DoctorService {
    Doctor createDoctorProfile(Doctor doctor, HttpServletRequest request);
    Doctor getDoctorByUser(HttpServletRequest request);
    List<DoctorWithUserDTO> getAllDoctors();
    Doctor updateDoctor(String doctorId, Doctor doctor, HttpServletRequest request);
}