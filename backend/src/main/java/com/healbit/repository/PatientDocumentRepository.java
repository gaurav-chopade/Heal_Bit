package com.healbit.repository;

import com.healbit.entity.PatientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientDocumentRepository extends JpaRepository<PatientDocument, Long> {

    List<PatientDocument> findByPatient_PatientIdOrderByUploadedAtDesc(Long patientId);

    Optional<PatientDocument> findByDocumentIdAndPatient_PatientId(Long documentId, Long patientId);
}
