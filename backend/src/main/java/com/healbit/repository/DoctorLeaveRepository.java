package com.healbit.repository;

import com.healbit.entity.DoctorLeave;
import com.healbit.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctor_DoctorIdOrderByRequestedAtDesc(Long doctorId);
    List<DoctorLeave> findByDoctor_Hospital_HospitalIdOrderByRequestedAtDesc(Long hospitalId);
    boolean existsByDoctor_DoctorIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long doctorId, LeaveStatus status, LocalDate startDate, LocalDate endDate);
}
