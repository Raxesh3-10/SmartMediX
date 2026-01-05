package com.eHealth.eHealth.doctor.service;

import com.eHealth.eHealth.model.Doctor;

public interface DoctorService {

    Doctor createDoctorProfile(Doctor doctor, String jwt);

    Doctor getDoctorById(String doctorId, String jwt);

    Doctor getDoctorByUser(String jwt);

    Doctor updateDoctor(String doctorId, Doctor doctor, String jwt);

    String deleteDoctor(String doctorId, String jwt);
}