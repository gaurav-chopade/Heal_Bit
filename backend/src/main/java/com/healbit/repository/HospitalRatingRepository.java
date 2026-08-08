package com.healbit.repository;

import com.healbit.entity.HospitalRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRatingRepository extends JpaRepository<HospitalRating, Long> {

    Optional<HospitalRating> findByHospital_HospitalIdAndPatient_PatientId(Long hospitalId, Long patientId);

    List<HospitalRating> findByHospital_HospitalIdOrderByCreatedAtDesc(Long hospitalId);

    @Query("SELECT AVG(r.rating) FROM HospitalRating r WHERE r.hospital.hospitalId = :hospitalId")
    Double findAverageRatingByHospitalId(@Param("hospitalId") Long hospitalId);

    long countByHospital_HospitalId(Long hospitalId);
}
