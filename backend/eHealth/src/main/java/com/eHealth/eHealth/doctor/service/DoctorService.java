package com.eHealth.eHealth.doctor.service;
import java.util.List;
import com.eHealth.eHealth.dto.DoctorWithUserDTO;
import com.eHealth.eHealth.model.Doctor;
public interface DoctorService {
    Doctor createDoctorProfile(Doctor doctor, String jwt);
    Doctor getDoctorByUser(String jwt);
    List<DoctorWithUserDTO> getAllDoctors();
    Doctor updateDoctor(String doctorId, Doctor doctor);
}