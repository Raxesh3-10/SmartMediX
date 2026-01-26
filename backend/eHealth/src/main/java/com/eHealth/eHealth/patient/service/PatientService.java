package com.eHealth.eHealth.patient.service;

import java.util.List;

import com.eHealth.eHealth.dto.PatientWithUserDTO;
import com.eHealth.eHealth.model.Patient;

public interface PatientService {
    Patient createPatientProfile(Patient patient, String jwt);
    Patient getMyPatientProfile(String jwt);
    Patient updatePatient(String patientId, Patient patient);
    List<PatientWithUserDTO> getAllPatients();
}