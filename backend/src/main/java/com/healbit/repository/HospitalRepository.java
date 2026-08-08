package com.healbit.repository;

import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByEmail(String email);

    Optional<Hospital> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Hospital> findByHospitalIdAndDeletedFalse(Long hospitalId);

    List<Hospital> findAllByStatusAndDeletedFalse(HospitalStatus status);

    List<Hospital> findAllByDeletedFalse();

    // Admin filters
    List<Hospital> findAllByDeletedFalseOrderByCreatedAtDesc();

    List<Hospital> findByStatusAndDeletedFalseOrderByCreatedAtDesc(HospitalStatus status);

    // Public browse filters (active hospitals only)
    List<Hospital> findByStatusAndDeletedFalseAndCityContainingIgnoreCase(HospitalStatus status, String city);

    List<Hospital> findByStatusAndDeletedFalseAndHospitalNameContainingIgnoreCase(HospitalStatus status, String hospitalName);

    List<Hospital> findByStatusAndDeletedFalseAndPincodeStartingWith(HospitalStatus status, String pincode);

    List<Hospital> findByStatusAndDeletedFalseAndPincodeContaining(HospitalStatus status, String pincode);

    // ---- Paged variants for the public browse endpoint ----
    Page<Hospital> findByStatusAndDeletedFalse(HospitalStatus status, Pageable pageable);

    Page<Hospital> findByStatusAndDeletedFalseAndPincodeContaining(HospitalStatus status, String pincode, Pageable pageable);

    Page<Hospital> findByStatusAndDeletedFalseAndCityContainingIgnoreCase(HospitalStatus status, String city, Pageable pageable);

    Page<Hospital> findByStatusAndDeletedFalseAndHospitalNameContainingIgnoreCase(HospitalStatus status, String hospitalName, Pageable pageable);

    long countByStatusAndDeletedFalse(HospitalStatus status);

    long countByDeletedFalse();
}
