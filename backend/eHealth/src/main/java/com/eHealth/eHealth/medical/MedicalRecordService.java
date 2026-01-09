package com.eHealth.eHealth.medical;

import com.eHealth.eHealth.cloudinary.CloudinaryFileService;
import com.eHealth.eHealth.model.FileEntity;
import com.eHealth.eHealth.model.MedicalRecord;
import com.eHealth.eHealth.model.Patient;
import com.eHealth.eHealth.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class MedicalRecordService {

    private final PatientRepository patientRepo;
    private final CloudinaryFileService cloudinaryService;

    public MedicalRecordService(PatientRepository patientRepo,
                                CloudinaryFileService cloudinaryService) {
        this.patientRepo = patientRepo;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Create medical record with images + PDFs
     */
    public void createMedicalRecord(String patientId,
                                    String doctorId,
                                    String appointmentId,
                                    String diagnosis,
                                    String prescription,
                                    MultipartFile[] images,
                                    MultipartFile[] documents) throws Exception {

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (patient.getMedicalHistory() == null) {
            patient.setMedicalHistory(new ArrayList<>());
        }

        List<String> fileIds = new ArrayList<>();

        // Upload images
        if (images != null) {
            for (MultipartFile img : images) {
                FileEntity f = cloudinaryService.uploadImage(
                        img, patientId, appointmentId);
                fileIds.add(f.getFileId());
            }
        }

        // Upload PDFs
        if (documents != null) {
            for (MultipartFile doc : documents) {
                FileEntity f = cloudinaryService.uploadDocument(
                        doc, patientId, appointmentId);
                fileIds.add(f.getFileId());
            }
        }

        MedicalRecord record = new MedicalRecord();
        record.setDoctorId(doctorId); // "AI" or doctorId
        record.setAppointmentId(appointmentId);
        record.setDiagnosis(diagnosis);
        record.setPrescription(prescription);
        record.setFileIds(fileIds);
        record.setCreatedAt(Instant.now());

        patient.getMedicalHistory().add(record);
        patientRepo.save(patient);
    }
}