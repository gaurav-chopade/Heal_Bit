package com.healbit.repository;

import com.healbit.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAllByDeletedFalse();

    List<Doctor> findByHospital_HospitalIdAndDeletedFalse(Long hospitalId);

    Optional<Doctor> findByDoctorIdAndDeletedFalse(Long doctorId);

    Optional<Doctor> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    long countByDeletedFalse();

    long countByHospital_HospitalIdAndDeletedFalse(Long hospitalId);
}
