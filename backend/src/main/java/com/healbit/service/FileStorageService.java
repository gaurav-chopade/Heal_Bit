package com.healbit.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/** Stores uploaded files on disk under a configurable folder and serves them back. */
@Service
public class FileStorageService {

    @Value("${healbit.uploads.dir:uploads/patient-documents}")
    private String uploadsDir;

    private Path root;

    @PostConstruct
    public void init() {
        try {
            root = Paths.get(uploadsDir).toAbsolutePath().normalize();
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create the uploads directory: " + uploadsDir, e);
        }
    }

    /** Saves the file under a unique name and returns that stored name. */
    public String store(MultipartFile file) {
        try {
            String ext = extensionOf(file.getOriginalFilename());
            String stored = UUID.randomUUID().toString().replace("-", "") + (ext.isEmpty() ? "" : "." + ext);
            Path target = root.resolve(stored).normalize();
            // Guard against path traversal via a crafted name.
            if (!target.getParent().equals(root)) {
                throw new IllegalStateException("Invalid storage path");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return stored;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store the uploaded file", e);
        }
    }

    public Resource loadAsResource(String storedName) {
        try {
            Path file = root.resolve(storedName).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalStateException("File not found: " + storedName);
            }
            return resource;
        } catch (Exception e) {
            throw new IllegalStateException("Could not read file: " + storedName, e);
        }
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(root.resolve(storedName).normalize());
        } catch (IOException ignored) {
            // A missing file on disk shouldn't block deleting the DB record.
        }
    }

    private String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
