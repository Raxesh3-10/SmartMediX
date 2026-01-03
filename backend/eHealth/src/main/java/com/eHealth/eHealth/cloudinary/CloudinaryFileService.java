package com.eHealth.eHealth.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eHealth.eHealth.model.FileEntity;
import com.eHealth.eHealth.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Map;

@Service
public class CloudinaryFileService {

    private final Cloudinary cloudinary;
    private final FileRepository fileRepository;

    public CloudinaryFileService(Cloudinary cloudinary,
                                 FileRepository fileRepository) {
        this.cloudinary = cloudinary;
        this.fileRepository = fileRepository;
    }

    /* ================= IMAGE UPLOAD ================= */
    public FileEntity uploadImage(MultipartFile file,
                                  String ownerId,
                                  String appointmentId) throws Exception {

        validateImage(file);

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "smartmedix/images")
        );

        return saveFileMetadata(result, ownerId, appointmentId, "IMAGE");
    }

    /* ================= DOCUMENT UPLOAD ================= */
    public FileEntity uploadDocument(MultipartFile file,
                                     String ownerId,
                                     String appointmentId) throws Exception {

        validateDocument(file);

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "raw",
                        "folder", "smartmedix/documents"
                )
        );

        return saveFileMetadata(result, ownerId, appointmentId, "DOCUMENT");
    }

    /* ================= DELETE FILE ================= */
    public void deleteFile(String publicId) throws Exception {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        fileRepository.deleteById(publicId);
    }

    /* ================= INTERNAL HELPERS ================= */

    private FileEntity saveFileMetadata(Map<?, ?> result,
                                        String ownerId,
                                        String appointmentId,
                                        String type) {

        FileEntity fileEntity = new FileEntity();
        fileEntity.setOwnerId(ownerId);
        fileEntity.setAppointmentId(appointmentId);
        fileEntity.setCloudinaryUrl(result.get("secure_url").toString());
        fileEntity.setPublicId(result.get("public_id").toString());
        fileEntity.setFileType(type);
        fileEntity.setUploadedAt(Instant.now());

        return fileRepository.save(fileEntity);
    }

    private void validateImage(MultipartFile file) {
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Invalid image type");
        }
    }

    private void validateDocument(MultipartFile file) {
        if (!file.getOriginalFilename().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF documents allowed");
        }
    }
}