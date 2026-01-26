package com.eHealth.eHealth.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class CloudinaryFileService {

    private final Cloudinary cloudinary;

    public CloudinaryFileService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /* ================= IMAGE ================= */
    @Transactional
    public String uploadImage(
            MultipartFile file,
            String folder,
            String ownerId) throws Exception {

        validateImage(file);

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder + "/" + ownerId,
                        "resource_type", "image",
                        "use_filename", true,
                        "unique_filename", false
                )
        );

        return result.get("secure_url").toString();
    }
    @Transactional
    public void deleteImage(String publicId) {
        delete(publicId, "image");
    }

    /* ================= DOCUMENT (PDF) ================= */
    @Transactional
    public String uploadDocument(
            MultipartFile file,
            String folder,
            String ownerId) throws Exception {

        validateDocument(file);

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder + "/" + ownerId,
                        "resource_type", "raw",
                        "use_filename", true,
                        "unique_filename", false
                )
        );

        return result.get("secure_url").toString();
    }
    
    @Transactional
    public void deleteDocument(String publicId) {
        delete(publicId, "raw");
    }

    /* ================= COMMON DELETE ================= */
    @Transactional
    private void delete(String publicId, String resourceType) {
        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", resourceType
                    )
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from Cloudinary");
        }
    }

    /* ================= VALIDATION ================= */
    
    private void validateImage(MultipartFile file) {
        if (file.getContentType() == null ||
            !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Invalid image type");
        }
    }

    private void validateDocument(MultipartFile file) {
        if (file.getOriginalFilename() == null ||
            !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF documents allowed");
        }
    }
}
