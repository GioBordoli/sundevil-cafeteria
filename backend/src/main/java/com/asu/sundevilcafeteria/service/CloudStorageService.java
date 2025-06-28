package com.asu.sundevilcafeteria.service;

import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class CloudStorageService {
    
    private final Storage storage;
    
    @Value("${gcp.bucket.name:sundevil-cafeteria-images}")
    private String bucketName;
    
    @Value("${gcp.project.id:sundevil-cafeteria}")
    private String projectId;
    
    public CloudStorageService() {
        this.storage = StorageOptions.getDefaultInstance().getService();
    }
    
    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".jpg";
        String filename = "menu-items/" + UUID.randomUUID().toString() + extension;
        
        // Create blob info
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, filename)
            .setContentType(contentType)
            .setAcl(java.util.Arrays.asList(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER)))
            .build();
        
        // Upload file
        Blob blob = storage.create(blobInfo, file.getBytes());
        
        // Return public URL
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, filename);
    }
    
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains(bucketName)) {
            return;
        }
        
        try {
            // Extract filename from URL
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            if (filename.contains("menu-items/")) {
                filename = "menu-items/" + filename.substring(filename.lastIndexOf("/") + 1);
            }
            
            // Delete blob
            storage.delete(bucketName, filename);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete image: " + e.getMessage());
        }
    }
    
    public boolean createBucketIfNotExists() {
        try {
            Bucket bucket = storage.get(bucketName);
            if (bucket == null) {
                BucketInfo bucketInfo = BucketInfo.newBuilder(bucketName)
                    .setLocation("US")
                    .build();
                storage.create(bucketInfo);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Failed to create bucket: " + e.getMessage());
            return false;
        }
    }
} 