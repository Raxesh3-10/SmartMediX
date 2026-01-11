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

    public CloudinaryFileService(
            Cloudinary cloudinary,
            FileRepository fileRepository) {
        this.cloudinary = cloudinary;
        this.fileRepository = fileRepository;
    }

    /* ================= IMAGE ================= */

    public FileEntity uploadImage(
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

        return save(result, ownerId, "IMAGE", file.getOriginalFilename());
    }

    /* ================= DOCUMENT (PDF) ================= */

    public FileEntity uploadDocument(
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

        return save(result, ownerId, "DOCUMENT", file.getOriginalFilename());
    }

    /* ================= COMMON ================= */

    private FileEntity save(
            Map<?, ?> result,
            String ownerId,
            String type,
            String originalFilename) {

        FileEntity file = new FileEntity();
        file.setOwnerId(ownerId);
        file.setCloudinaryUrl(result.get("secure_url").toString());
        file.setPublicId(result.get("public_id").toString());
        file.setFileType(type);
        file.setUploadedAt(Instant.now());

        return fileRepository.save(file);
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