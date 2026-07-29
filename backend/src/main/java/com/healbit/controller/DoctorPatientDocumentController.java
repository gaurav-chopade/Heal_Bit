package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.PatientDocumentResponse;
import com.healbit.entity.PatientDocument;
import com.healbit.service.FileStorageService;
import com.healbit.service.PatientDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Lets a doctor read the documents of a patient they share an appointment with.
 * Access is enforced in the service (appointment must exist and be live).
 */
@RestController
@RequestMapping("/doctors/patients")
public class DoctorPatientDocumentController {

    private final PatientDocumentService documentService;
    private final FileStorageService storage;

    public DoctorPatientDocumentController(PatientDocumentService documentService, FileStorageService storage) {
        this.documentService = documentService;
        this.storage = storage;
    }

    @GetMapping("/{patientId}/documents")
    public ResponseEntity<List<PatientDocumentResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(documentService.listForDoctor(principal.getId(), patientId));
    }

    @GetMapping("/{patientId}/documents/{id}")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId,
            @PathVariable Long id) {
        PatientDocument doc = documentService.getForDoctor(principal.getId(), patientId, id);
        Resource resource = storage.loadAsResource(doc.getStoredName());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalName() + "\"")
                .body(resource);
    }
}
