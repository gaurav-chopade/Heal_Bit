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

    public PatientDocumentService(PatientDocumentRepository documentRepository,
                                  PatientRepository patientRepository,
                                  AppointmentRepository appointmentRepository,
                                  FileStorageService storage) {
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.storage = storage;
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

        String stored = storage.store(file);

        PatientDocument doc = new PatientDocument();
        doc.setPatient(patient);
        doc.setOriginalName(StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename() : stored);
        doc.setStoredName(stored);
        doc.setContentType(type.toLowerCase());
        doc.setFileSize(file.getSize());

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
        storage.delete(doc.getStoredName());
        documentRepository.delete(doc);
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
