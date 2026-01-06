package com.eHealth.eHealth.medical;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.eHealth.eHealth.model.MedicalRecord;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.repository.PatientRepository;

@Service
public class MedicalRecordService {

    private final PatientRepository patientRepo;

    public MedicalRecordService(PatientRepository patientRepo) {
        this.patientRepo = patientRepo;
    }

    public void createMedicalRecord(String patientId,
                                    String doctorId,
                                    String appointmentId,
                                    String diagnosis,
                                    String prescription,
                                    List<String> fileIds) {

        MedicalRecord record = new MedicalRecord();
        record.setDoctorId(doctorId); // "AI" or real doctorId
        record.setAppointmentId(appointmentId);
        record.setDiagnosis(diagnosis);
        record.setPrescription(prescription);
        record.setFileIds(fileIds);
        record.setCreatedAt(Instant.now());

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.getMedicalHistory().add(record);
        patientRepo.save(patient);
    }
}