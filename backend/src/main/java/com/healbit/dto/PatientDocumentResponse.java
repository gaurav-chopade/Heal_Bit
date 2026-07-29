package com.healbit.dto;

import java.time.LocalDateTime;

public class PatientDocumentResponse {

    private Long documentId;
    private String name;
    private String contentType;
    private long size;
    private boolean image;
    private LocalDateTime uploadedAt;

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public boolean isImage() { return image; }
    public void setImage(boolean image) { this.image = image; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
