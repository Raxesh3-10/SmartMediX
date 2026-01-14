package com.eHealth.eHealth.cloudinary.controller;

import com.eHealth.eHealth.cloudinary.CloudinaryFileService;
import com.eHealth.eHealth.repository.JwtSessionRepository;
import com.eHealth.eHealth.utility.JwtUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/chat/files")
public class ChatFileController {

    private final CloudinaryFileService cloudinaryService;
    private final JwtSessionRepository jwtSessionRepository;

    public ChatFileController(
            CloudinaryFileService cloudinaryService,
            JwtSessionRepository jwtSessionRepository) {
        this.cloudinaryService = cloudinaryService;
        this.jwtSessionRepository = jwtSessionRepository;
    }

    /* ================= IMAGE UPLOAD ================= */

    @PostMapping("/image")
    public String uploadImage(
            @RequestHeader("JWT") String token,
            @RequestParam MultipartFile file,
            @RequestParam String ownerId) throws Exception {

        validateToken(token);

        return cloudinaryService.uploadImage(
                file,
                "smartmedix/chat/images",
                ownerId
        );
    }

    /* ================= DOCUMENT UPLOAD ================= */

    @PostMapping("/document")
    public String uploadDocument(
            @RequestHeader("JWT") String token,
            @RequestParam MultipartFile file,
            @RequestParam String ownerId) throws Exception {

        validateToken(token);

        return cloudinaryService.uploadDocument(
                file,
                "smartmedix/chat/documents",
                ownerId
        );
    }

    /* ================= IMAGE DELETE ================= */

    @DeleteMapping("/image")
    public void deleteImage(
            @RequestHeader("JWT") String token,
            @RequestParam String publicId) {

        validateToken(token);
        cloudinaryService.deleteImage(publicId);
    }

    /* ================= DOCUMENT DELETE ================= */

    @DeleteMapping("/document")
    public void deleteDocument(
            @RequestHeader("JWT") String token,
            @RequestParam String publicId) {

        validateToken(token);
        cloudinaryService.deleteDocument(publicId);
    }

    private void validateToken(String token) {
        if (!JwtUtil.isTokenValid(token, jwtSessionRepository)) {
            throw new RuntimeException("Invalid or expired token");
        }
    }
}