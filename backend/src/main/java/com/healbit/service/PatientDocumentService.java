package com.healbit.service;

import com.healbit.dto.PatientDocumentResponse;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Patient;
import com.healbit.entity.PatientDocument;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.PatientDocumentRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Transactional
@Service
public class PatientDocumentService {

    public static final long MAX_SIZE = 10L * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    // A doctor may see a patient's documents only if they share a live appointment.
    private static final Set<AppointmentStatus> RELATED = EnumSet.of(
            AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED);

    private final PatientDocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final FileStorageService storage;
    private final CloudinaryService cloudinary;

    public PatientDocumentService(PatientDocumentRepository documentRepository,
                                  PatientRepository patientRepository,
                                  AppointmentRepository appointmentRepository,
                                  FileStorageService storage,
                                  CloudinaryService cloudinary) {
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.storage = storage;
        this.cloudinary = cloudinary;
    }

    public PatientDocumentResponse upload(Long patientId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a file to upload");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File is too large. The maximum size is 10 MB");
        }
        String type = file.getContentType();
        if (!StringUtils.hasText(type) || !ALLOWED_TYPES.contains(type.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Allowed: images, PDF, Word documents, and text files");
        }

        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));

        PatientDocument doc = new PatientDocument();
        doc.setPatient(patient);
        doc.setContentType(type.toLowerCase());
        doc.setFileSize(file.getSize());

        String originalName = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename() : "document";
        doc.setOriginalName(originalName);

        if (cloudinary.isEnabled()) {
            // Medical records are uploaded as PRIVATE assets — they are only ever served
            // back through this backend, after the ownership check below.
            byte[] bytes;
            try {
                bytes = file.getBytes();
            } catch (java.io.IOException e) {
                throw new IllegalStateException("Could not read the uploaded file");
            }
            // Images go up as images (so thumbnails work); every other document is stored as a
            // "raw" file, which sidesteps Cloudinary's PDF/ZIP delivery restriction entirely.
            String resourceType = type.toLowerCase().startsWith("image/") ? "auto" : "raw";
            CloudinaryService.Stored s = cloudinary.upload(bytes, "patient-documents", originalName, true, resourceType);
            doc.setStorage("CLOUDINARY");
            doc.setStoredName(s.publicId());
            doc.setResourceType(s.resourceType());
            doc.setDeliveryType(s.deliveryType());
            doc.setFormat(s.format());
            doc.setUrl(s.url());
        } else {
            doc.setStorage("LOCAL");
            doc.setStoredName(storage.store(file));
        }

        return toResponse(documentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public List<PatientDocumentResponse> list(Long patientId) {
        return documentRepository.findByPatient_PatientIdOrderByUploadedAtDesc(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Returns the document only if it belongs to the given patient. */
    @Transactional(readOnly = true)
    public PatientDocument getOwned(Long patientId, Long documentId) {
        return documentRepository.findByDocumentIdAndPatient_PatientId(documentId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    public void delete(Long patientId, Long documentId) {
        PatientDocument doc = getOwned(patientId, documentId);
        if (doc.isCloudStored()) {
            cloudinary.delete(doc.getStoredName(), doc.getResourceType(), doc.getDeliveryType());
        } else {
            storage.delete(doc.getStoredName());
        }
        documentRepository.delete(doc);
    }

    /**
     * Reads a document's bytes from wherever it lives. Callers must have already verified
     * that the requester is allowed to see it.
     */
    @Transactional(readOnly = true)
    public byte[] loadContent(PatientDocument doc) {
        if (doc.isCloudStored()) {
            return cloudinary.download(doc.getStoredName(), doc.getResourceType(),
                    doc.getDeliveryType(), doc.getFormat(), doc.getUrl());
        }
        try {
            return storage.loadAsResource(doc.getStoredName()).getInputStream().readAllBytes();
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Could not read the stored file");
        }
    }

    // ---------------- Doctor access (only for their own patients) ----------------

    @Transactional(readOnly = true)
    public List<PatientDocumentResponse> listForDoctor(Long doctorId, Long patientId) {
        ensureDoctorRelated(doctorId, patientId);
        return list(patientId);
    }

    /** Returns the document if it belongs to the patient AND that patient is the doctor's. */
    @Transactional(readOnly = true)
    public PatientDocument getForDoctor(Long doctorId, Long patientId, Long documentId) {
        ensureDoctorRelated(doctorId, patientId);
        return documentRepository.findByDocumentIdAndPatient_PatientId(documentId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    private void ensureDoctorRelated(Long doctorId, Long patientId) {
        boolean related = appointmentRepository
                .existsByDoctor_DoctorIdAndPatient_PatientIdAndStatusIn(doctorId, patientId, RELATED);
        if (!related) {
            throw new UnauthorizedException("You can only view documents of patients who have an appointment with you");
        }
    }

    private PatientDocumentResponse toResponse(PatientDocument d) {
        PatientDocumentResponse r = new PatientDocumentResponse();
        r.setDocumentId(d.getDocumentId());
        r.setName(d.getOriginalName());
        r.setContentType(d.getContentType());
        r.setSize(d.getFileSize());
        r.setImage(d.getContentType() != null && d.getContentType().startsWith("image/"));
        r.setUploadedAt(d.getUploadedAt());
        return r;
    }
}
