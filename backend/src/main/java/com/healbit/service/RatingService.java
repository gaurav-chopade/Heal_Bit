package com.healbit.service;

import com.healbit.dto.RatingRequest;
import com.healbit.dto.RatingResponse;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Doctor;
import com.healbit.entity.DoctorRating;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalRating;
import com.healbit.entity.Patient;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRatingRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.HospitalRatingRepository;
import com.healbit.repository.HospitalRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class RatingService {

    private final DoctorRatingRepository doctorRatingRepository;
    private final HospitalRatingRepository hospitalRatingRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public RatingService(DoctorRatingRepository doctorRatingRepository,
                         HospitalRatingRepository hospitalRatingRepository,
                         DoctorRepository doctorRepository,
                         HospitalRepository hospitalRepository,
                         PatientRepository patientRepository,
                         AppointmentRepository appointmentRepository) {
        this.doctorRatingRepository = doctorRatingRepository;
        this.hospitalRatingRepository = hospitalRatingRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /** Patient rates a doctor. Requires at least one COMPLETED appointment with that doctor. Upserts. */
    public RatingResponse rateDoctor(Long patientId, Long doctorId, RatingRequest request) {
        Patient patient = requirePatient(patientId);
        Doctor doctor = doctorRepository.findByDoctorIdAndDeletedFalse(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + doctorId));

        boolean hasCompletedVisit = appointmentRepository
                .existsByPatient_PatientIdAndDoctor_DoctorIdAndStatus(patientId, doctorId, AppointmentStatus.COMPLETED);
        if (!hasCompletedVisit) {
            throw new UnauthorizedException("You can only rate a doctor after a completed appointment with them");
        }

        DoctorRating rating = doctorRatingRepository.findByDoctor_DoctorIdAndPatient_PatientId(doctorId, patientId)
                .orElseGet(DoctorRating::new);
        rating.setDoctor(doctor);
        rating.setPatient(patient);
        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        return toResponse(doctorRatingRepository.save(rating));
    }

    /** Patient rates a hospital. Requires at least one COMPLETED appointment at that hospital. Upserts. */
    public RatingResponse rateHospital(Long patientId, Long hospitalId, RatingRequest request) {
        Patient patient = requirePatient(patientId);
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));

        boolean hasCompletedVisit = appointmentRepository
                .existsByPatient_PatientIdAndHospital_HospitalIdAndStatus(patientId, hospitalId, AppointmentStatus.COMPLETED);
        if (!hasCompletedVisit) {
            throw new UnauthorizedException("You can only rate a hospital after a completed appointment there");
        }

        HospitalRating rating = hospitalRatingRepository.findByHospital_HospitalIdAndPatient_PatientId(hospitalId, patientId)
                .orElseGet(HospitalRating::new);
        rating.setHospital(hospital);
        rating.setPatient(patient);
        rating.setRating(request.getRating());
        rating.setReview(request.getReview());

        return toResponse(hospitalRatingRepository.save(rating));
    }

    public List<RatingResponse> getDoctorRatings(Long doctorId) {
        return doctorRatingRepository.findByDoctor_DoctorIdOrderByCreatedAtDesc(doctorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<RatingResponse> getHospitalRatings(Long hospitalId) {
        return hospitalRatingRepository.findByHospital_HospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private Patient requirePatient(Long patientId) {
        return patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));
    }

    private RatingResponse toResponse(DoctorRating r) {
        RatingResponse dto = new RatingResponse();
        dto.setRatingId(r.getRatingId());
        dto.setPatientId(r.getPatient().getPatientId());
        dto.setPatientName(r.getPatient().getFullName());
        dto.setRating(r.getRating());
        dto.setReview(r.getReview());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }

    private RatingResponse toResponse(HospitalRating r) {
        RatingResponse dto = new RatingResponse();
        dto.setRatingId(r.getRatingId());
        dto.setPatientId(r.getPatient().getPatientId());
        dto.setPatientName(r.getPatient().getFullName());
        dto.setRating(r.getRating());
        dto.setReview(r.getReview());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
