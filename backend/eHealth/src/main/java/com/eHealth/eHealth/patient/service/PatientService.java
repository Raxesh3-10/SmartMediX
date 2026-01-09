package com.eHealth.eHealth.patient.service;

import com.eHealth.eHealth.model.Patient;

public interface PatientService {

    Patient createPatientProfile(Patient patient, String jwt);

    Patient getMyPatientProfile(String jwt);

    Patient updatePatient(String patientId, Patient patient, String jwt);

    String deletePatient(String patientId, String jwt);
}