package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.PatientDocumentResponse;
import com.healbit.entity.PatientDocument;
import com.healbit.service.FileStorageService;
import com.healbit.service.PatientDocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/patients/documents")
public class PatientDocumentController {

    private final PatientDocumentService documentService;
    private final FileStorageService storage;

    public PatientDocumentController(PatientDocumentService documentService, FileStorageService storage) {
        this.documentService = documentService;
        this.storage = storage;
    }

    /** Patient uploads a document/image (multipart form field "file"). */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientDocumentResponse> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        return new ResponseEntity<>(documentService.upload(principal.getId(), file), HttpStatus.CREATED);
    }

    /** Patient lists their own documents (metadata only). */
    @GetMapping
    public ResponseEntity<List<PatientDocumentResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(documentService.list(principal.getId()));
    }

    /** Patient views/downloads one of their own files. */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        PatientDocument doc = documentService.getOwned(principal.getId(), id);
        Resource resource = storage.loadAsResource(doc.getStoredName());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalName() + "\"")
                .body(resource);
    }

    /** Patient deletes one of their own documents. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        documentService.delete(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Document deleted"));
    }
}
