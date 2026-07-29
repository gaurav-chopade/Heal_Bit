package com.healbit.repository;

import com.healbit.entity.DoctorRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRatingRepository extends JpaRepository<DoctorRating, Long> {

    Optional<DoctorRating> findByDoctor_DoctorIdAndPatient_PatientId(Long doctorId, Long patientId);

    List<DoctorRating> findByDoctor_DoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT AVG(r.rating) FROM DoctorRating r WHERE r.doctor.doctorId = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    long countByDoctor_DoctorId(Long doctorId);
}
