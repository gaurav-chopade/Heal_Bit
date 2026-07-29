package com.healbit.repository;

import com.healbit.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    Optional<Patient> findByPatientIdAndDeletedFalse(Long patientId);

    List<Patient> findAllByDeletedFalse();

    long countByDeletedFalse();
}
