package com.edusphere.service;

import com.edusphere.config.StorageConfig;
import com.edusphere.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final StorageConfig storageConfig;
    private Path rootLocation;

    public FileStorageService(StorageConfig storageConfig) {
        this.storageConfig = storageConfig;
    }

    @PostConstruct
    public void init() {
        try {
            this.rootLocation = Paths.get(storageConfig.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(this.rootLocation);
            Files.createDirectories(this.rootLocation.resolve("materials"));
            Files.createDirectories(this.rootLocation.resolve("assignments"));
            Files.createDirectories(this.rootLocation.resolve("submissions"));
            Files.createDirectories(this.rootLocation.resolve("achievements"));
            Files.createDirectories(this.rootLocation.resolve("leaves"));
            Files.createDirectories(this.rootLocation.resolve("profiles"));
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        String cleanFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (cleanFileName.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + cleanFileName);
        }

        try {
            String extension = "";
            int i = cleanFileName.lastIndexOf('.');
            if (i > 0) {
                extension = cleanFileName.substring(i);
            }
            String uniqueName = UUID.randomUUID() + extension;
            Path targetLocation = this.rootLocation.resolve(subFolder).resolve(uniqueName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return subFolder + "/" + uniqueName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found or not readable: " + relativePath);
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("File path is invalid: " + relativePath);
        }
    }
}
