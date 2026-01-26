package com.eHealth.eHealth.cloudinary.controller;
import com.eHealth.eHealth.cloudinary.CloudinaryFileService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/chat/files")
public class ChatFileController {
    private final CloudinaryFileService cloudinaryService;

    public ChatFileController(CloudinaryFileService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    @PostMapping("/image")
    public String uploadImage( @RequestParam MultipartFile file,@RequestParam String ownerId) throws Exception {
        return cloudinaryService.uploadImage( file,"smartmedix/chat/images", ownerId
        );
    }
    @PostMapping("/document")
    public String uploadDocument( @RequestParam MultipartFile file, @RequestParam String ownerId) throws Exception {
        return cloudinaryService.uploadDocument(file,"smartmedix/chat/documents",ownerId
        );
    }
    @DeleteMapping("/image")
    public void deleteImage(@RequestParam String publicId) {
        cloudinaryService.deleteImage(publicId);
    }
    @DeleteMapping("/document")
    public void deleteDocument(@RequestParam String publicId) {
        cloudinaryService.deleteDocument(publicId);
    }
}