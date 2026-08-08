package com.healbit.service;

import com.healbit.dto.HospitalResponse;
import com.healbit.dto.PageResponse;
import com.healbit.dto.HospitalUpdateRequest;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import com.healbit.entity.Patient;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.HospitalRatingRepository;
import com.healbit.repository.HospitalRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalRatingRepository hospitalRatingRepository;
    private final PatientRepository patientRepository;
    private final HospitalImageService hospitalImageService;

    public HospitalService(HospitalRepository hospitalRepository,
                           HospitalRatingRepository hospitalRatingRepository,
                           PatientRepository patientRepository,
                           HospitalImageService hospitalImageService) {
        this.hospitalRepository = hospitalRepository;
        this.hospitalRatingRepository = hospitalRatingRepository;
        this.patientRepository = patientRepository;
        this.hospitalImageService = hospitalImageService;
    }

    /**
     * Public browse + optional search by city, name, or pincode. Only ACTIVE, non-deleted
     * hospitals are visible.
     *
     * Ordering: when the viewer is a signed-in patient, hospitals in the patient's own city are
     * shown first, followed by the rest — within each group, higher-rated hospitals come first,
     * then alphabetically by name. Explicit city/name/pincode search filters still narrow the
     * result set exactly as before; the city-preference only affects ordering, not filtering.
     */
    public PageResponse<HospitalResponse> browseHospitals(String city, String name, String pincode, int page, int size,
                                                            Long viewingPatientId) {
        // Normalise: trim so stray spaces don't break matching.
        city = city == null ? null : city.trim();
        name = name == null ? null : name.trim();
        pincode = pincode == null ? null : pincode.trim();

        int pageNumber = Math.max(page, 0);
        int pageSize = (size <= 0 || size > 100) ? 10 : size;

        List<Hospital> matches;
        if (StringUtils.hasText(pincode)) {
            matches = hospitalRepository.findByStatusAndDeletedFalseAndPincodeContaining(HospitalStatus.ACTIVE, pincode);
        } else if (StringUtils.hasText(city)) {
            matches = hospitalRepository.findByStatusAndDeletedFalseAndCityContainingIgnoreCase(HospitalStatus.ACTIVE, city);
        } else if (StringUtils.hasText(name)) {
            matches = hospitalRepository.findByStatusAndDeletedFalseAndHospitalNameContainingIgnoreCase(HospitalStatus.ACTIVE, name);
        } else {
            matches = hospitalRepository.findAllByStatusAndDeletedFalse(HospitalStatus.ACTIVE);
        }

        String preferredCity = resolvePreferredCity(viewingPatientId);

        List<HospitalResponse> sorted = matches.stream()
                .map(this::toResponse)
                .sorted(hospitalOrdering(preferredCity))
                .collect(Collectors.toList());

        return paginate(sorted, pageNumber, pageSize);
    }

    private Comparator<HospitalResponse> hospitalOrdering(String preferredCity) {
        Comparator<HospitalResponse> byCityMatch = Comparator.comparing(
                (HospitalResponse h) -> !(StringUtils.hasText(preferredCity) && preferredCity.equalsIgnoreCase(h.getCity())));
        Comparator<HospitalResponse> byRating = Comparator.comparing(
                (HospitalResponse h) -> h.getAverageRating() == null ? -1.0 : h.getAverageRating(),
                Comparator.reverseOrder());
        Comparator<HospitalResponse> byName = Comparator.comparing(
                HospitalResponse::getHospitalName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        return byCityMatch.thenComparing(byRating).thenComparing(byName);
    }

    /** The signed-in patient's own city, if any — used only to prioritise same-city hospitals. */
    private String resolvePreferredCity(Long viewingPatientId) {
        if (viewingPatientId == null) return null;
        return patientRepository.findByPatientIdAndDeletedFalse(viewingPatientId)
                .map(Patient::getCity)
                .filter(StringUtils::hasText)
                .orElse(null);
    }

    private PageResponse<HospitalResponse> paginate(List<HospitalResponse> all, int page, int size) {
        int totalElements = all.size();
        int totalPages = (int) Math.ceil(totalElements / (double) size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        PageResponse<HospitalResponse> response = new PageResponse<>();
        response.setContent(all.subList(fromIndex, toIndex));
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setFirst(page == 0);
        response.setLast(page >= totalPages - 1);
        return response;
    }

    public HospitalResponse getById(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        return toResponse(hospital);
    }

    public HospitalResponse updateProfile(Long hospitalId, HospitalUpdateRequest request) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));

        if (StringUtils.hasText(request.getHospitalName())) hospital.setHospitalName(request.getHospitalName());
        if (request.getPhone() != null) hospital.setPhone(request.getPhone());
        if (request.getAddress() != null) hospital.setAddress(request.getAddress());
        if (request.getCity() != null) hospital.setCity(request.getCity());
        if (request.getState() != null) hospital.setState(request.getState());
        if (request.getPincode() != null) hospital.setPincode(request.getPincode());
        if (request.getDescription() != null) hospital.setDescription(request.getDescription());
        hospitalImageService.apply(hospital, request.getImage());
        if (request.getAllowCancellationAfterAcceptance() != null) {
            hospital.setAllowCancellationAfterAcceptance(request.getAllowCancellationAfterAcceptance());
        }
        if (request.getCancellationMinHours() != null) {
            hospital.setCancellationMinHours(request.getCancellationMinHours());
        }

        return toResponse(hospitalRepository.save(hospital));
    }

    /** Soft delete: a hospital deactivates its own account. */
    public void softDelete(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        hospital.setDeleted(true);
        hospitalRepository.save(hospital);
    }

    private HospitalResponse toResponse(Hospital hospital) {
        HospitalResponse response = new HospitalResponse();
        response.setHospitalId(hospital.getHospitalId());
        response.setHospitalName(hospital.getHospitalName());
        response.setRegistrationNumber(hospital.getRegistrationNumber());
        response.setEmail(hospital.getEmail());
        response.setPhone(hospital.getPhone());
        response.setAddress(hospital.getAddress());
        response.setCity(hospital.getCity());
        response.setState(hospital.getState());
        response.setPincode(hospital.getPincode());
        response.setDescription(hospital.getDescription());
        response.setImageUrl(hospital.displayImage());
        response.setStatus(hospital.getStatus());
        response.setCreatedAt(hospital.getCreatedAt());
        response.setAverageRating(hospitalRatingRepository.findAverageRatingByHospitalId(hospital.getHospitalId()));
        response.setRatingCount(hospitalRatingRepository.countByHospital_HospitalId(hospital.getHospitalId()));
        response.setAllowCancellationAfterAcceptance(hospital.isAllowCancellationAfterAcceptance());
        response.setCancellationMinHours(hospital.getCancellationMinHours());
        return response;
    }
}
