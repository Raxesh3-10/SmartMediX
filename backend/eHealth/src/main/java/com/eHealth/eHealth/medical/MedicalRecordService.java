package com.eHealth.eHealth.medical;

import com.eHealth.eHealth.model.MedicalRecord;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class MedicalRecordService {

    private final PatientRepository patientRepo;

    public MedicalRecordService(PatientRepository patientRepo) {
        this.patientRepo = patientRepo;
    }

    /**
     * Create medical record using Cloudinary URLs
     */
    public void createMedicalRecord(
            String patientId,
            String doctorId,
            String appointmentId,
            String diagnosis,
            String prescription,
            List<String> fileUrls
    ) {

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (patient.getMedicalHistory() == null) {
            patient.setMedicalHistory(new ArrayList<>());
        }

        MedicalRecord record = new MedicalRecord();
        record.setDoctorId(doctorId);        // doctorId or "AI"
        record.setAppointmentId(appointmentId);
        record.setDiagnosis(diagnosis);
        record.setPrescription(prescription);
        record.setFileUrls(fileUrls != null ? fileUrls : new ArrayList<>());
        record.setCreatedAt(Instant.now());

        patient.getMedicalHistory().add(record);
        patientRepo.save(patient);
    }
}