package com.healbit.service;

import com.healbit.dto.PatientProfileResponse;
import com.healbit.dto.PatientProfileUpdateRequest;
import com.healbit.entity.Patient;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Transactional
@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public PatientProfileResponse getProfile(Long patientId) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));
        return toResponse(patient);
    }

    public PatientProfileResponse updateProfile(Long patientId, PatientProfileUpdateRequest request) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));

        patient.setFullName(request.getFullName());
        patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getAge() != null) {
            patient.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            patient.setCity(request.getCity());
        }

        Patient saved = patientRepository.save(patient);
        return toResponse(saved);
    }

    private PatientProfileResponse toResponse(Patient patient) {
        PatientProfileResponse response = new PatientProfileResponse();
        response.setPatientId(patient.getPatientId());
        response.setFullName(patient.getFullName());
        response.setEmail(patient.getEmail());
        response.setPhoneNumber(patient.getPhoneNumber());
        response.setAge(patient.getAge());
        response.setGender(patient.getGender());
        response.setAddress(patient.getAddress());
        response.setCity(patient.getCity());
        response.setCreatedAt(patient.getCreatedAt());
        return response;
    }
}
