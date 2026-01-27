package com.eHealth.eHealth.patient.service;

import java.util.List;
import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.Patient;
import jakarta.servlet.http.HttpServletRequest;

public interface PatientService {
    Patient createPatientProfile(Patient patient, HttpServletRequest request);
    Patient getMyPatientProfile(HttpServletRequest request);
    Patient updatePatient(String patientId, Patient patient, HttpServletRequest request);
    List<PatientWithUserDTO> getAllPatients();
}