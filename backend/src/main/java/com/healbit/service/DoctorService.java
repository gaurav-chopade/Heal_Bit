package com.healbit.service;

import com.healbit.dto.BreakPeriod;
import com.healbit.dto.DoctorAvailabilityRequest;
import com.healbit.dto.DoctorRequest;
import com.healbit.dto.DoctorResponse;
import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Doctor;
import com.healbit.entity.Hospital;
import com.healbit.exception.DuplicateResourceException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRatingRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.HospitalRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Transactional
@Service
public class DoctorService {

    private static final Set<AppointmentStatus> LIVE =
            Set.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRatingRepository doctorRatingRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository,
                         HospitalRepository hospitalRepository,
                         AppointmentRepository appointmentRepository,
                         DoctorRatingRepository doctorRatingRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRatingRepository = doctorRatingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Browse doctors. If hospitalId is provided, list that hospital's doctors; otherwise list all.
     *  Higher-rated doctors are shown first. */
    public List<DoctorResponse> listDoctors(Long hospitalId) {
        List<Doctor> doctors = (hospitalId != null)
                ? doctorRepository.findByHospital_HospitalIdAndDeletedFalse(hospitalId)
                : doctorRepository.findAllByDeletedFalse();
        return doctors.stream().map(this::toResponse).sorted(byRatingDesc()).collect(Collectors.toList());
    }

    /** A hospital lists only its own doctors, highest rated first. */
    public List<DoctorResponse> listOwnDoctors(Long hospitalId) {
        return doctorRepository.findByHospital_HospitalIdAndDeletedFalse(hospitalId)
                .stream().map(this::toResponse).sorted(byRatingDesc()).collect(Collectors.toList());
    }

    private Comparator<DoctorResponse> byRatingDesc() {
        Comparator<DoctorResponse> byRating = Comparator.comparing(
                (DoctorResponse d) -> d.getAverageRating() == null ? -1.0 : d.getAverageRating(),
                Comparator.reverseOrder());
        Comparator<DoctorResponse> byName = Comparator.comparing(
                DoctorResponse::getDoctorName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        return byRating.thenComparing(byName);
    }

    public DoctorResponse getDoctor(Long doctorId) {
        return toResponse(findDoctor(doctorId));
    }

    // ---------------- Hospital-managed CRUD ----------------

    public DoctorResponse addDoctor(Long hospitalId, DoctorRequest request) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));

        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("Doctor email is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("An initial password is required for the doctor's login");
        }
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A doctor with this email already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setHospital(hospital);
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        applyProfile(doctor, request);

        return toResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse updateDoctor(Long hospitalId, DoctorRequest request) {
        if (request.getDoctorId() == null) {
            throw new IllegalArgumentException("doctorId is required to update a doctor");
        }
        Doctor doctor = findDoctor(request.getDoctorId());
        ensureOwnership(doctor, hospitalId);

        // Email change (kept unique). Password change is optional on update.
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equalsIgnoreCase(doctor.getEmail())) {
            if (doctorRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("A doctor with this email already exists");
            }
            doctor.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getPassword())) {
            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        applyProfile(doctor, request);

        return toResponse(doctorRepository.save(doctor));
    }

    public void deleteDoctor(Long hospitalId, Long doctorId) {
        Doctor doctor = findDoctor(doctorId);
        ensureOwnership(doctor, hospitalId);
        doctor.setDeleted(true);
        doctorRepository.save(doctor);
    }

    // ---------------- Doctor self-service ----------------

    public DoctorResponse getOwnProfile(Long doctorId) {
        return toResponse(findDoctor(doctorId));
    }

    public DoctorResponse updateOwnSchedule(Long doctorId, DoctorAvailabilityRequest request) {
        Doctor doctor = findDoctor(doctorId);
        if (request.getWorkingDays() != null) {
            doctor.setWorkingDays(ScheduleUtil.toWorkingDaysCsv(request.getWorkingDays()));
        }
        if (request.getStartTime() != null) doctor.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) doctor.setEndTime(request.getEndTime());
        if (doctor.getStartTime() != null && doctor.getEndTime() != null
                && !doctor.getStartTime().isBefore(doctor.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getBreaks() != null) {
            validateBreaks(request.getBreaks(), doctor.getStartTime(), doctor.getEndTime());
            doctor.setBreaks(ScheduleUtil.toBreaksString(request.getBreaks()));
        }
        return toResponse(doctorRepository.save(doctor));
    }

    // ---------------- Slots ----------------

    /** Free 30-minute slot start times ("HH:mm") for a doctor on a given date. */
    public List<String> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = findDoctor(doctorId);
        List<String> out = new ArrayList<>();
        if (date == null || date.isBefore(LocalDate.now()) || !ScheduleUtil.scheduleConfigured(doctor)) {
            return out;
        }
        Set<DayOfWeek> days = ScheduleUtil.parseWorkingDays(doctor.getWorkingDays());
        if (!days.contains(date.getDayOfWeek())) return out;

        Set<LocalTime> taken = appointmentRepository
                .findByDoctor_DoctorIdAndAppointmentDateAndStatusIn(doctorId, date, LIVE)
                .stream().map(Appointment::getAppointmentTime).collect(Collectors.toSet());

        List<BreakPeriod> breaks = ScheduleUtil.parseBreaks(doctor.getBreaks());
        boolean isToday = date.equals(LocalDate.now());
        LocalTime now = LocalTime.now();

        for (LocalTime slot : ScheduleUtil.generateSlots(doctor.getStartTime(), doctor.getEndTime(), breaks)) {
            if (taken.contains(slot)) continue;
            if (isToday && !slot.isAfter(now)) continue;
            out.add(slot.toString().length() == 5 ? slot.toString() : String.format("%02d:%02d", slot.getHour(), slot.getMinute()));
        }
        return out;
    }

    // ---------------- Helpers ----------------

    private Doctor findDoctor(Long doctorId) {
        return doctorRepository.findByDoctorIdAndDeletedFalse(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + doctorId));
    }

    private void ensureOwnership(Doctor doctor, Long hospitalId) {
        if (!doctor.getHospital().getHospitalId().equals(hospitalId)) {
            throw new UnauthorizedException("Hospitals can only manage their own doctors");
        }
    }

    private void applyProfile(Doctor doctor, DoctorRequest request) {
        doctor.setDoctorName(request.getDoctorName());
        doctor.setQualification(request.getQualification());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setExperience(request.getExperience());
        doctor.setConsultationFee(request.getConsultationFee());
        if (request.getWorkingDays() != null) {
            doctor.setWorkingDays(ScheduleUtil.toWorkingDaysCsv(request.getWorkingDays()));
        }
        if (request.getStartTime() != null) doctor.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) doctor.setEndTime(request.getEndTime());
        if (doctor.getStartTime() != null && doctor.getEndTime() != null
                && !doctor.getStartTime().isBefore(doctor.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (request.getBreaks() != null) {
            validateBreaks(request.getBreaks(), doctor.getStartTime(), doctor.getEndTime());
            doctor.setBreaks(ScheduleUtil.toBreaksString(request.getBreaks()));
        }
    }

    /** Each break must have start < end, and (when the working window is known) fall within it. */
    private void validateBreaks(List<BreakPeriod> breaks, LocalTime workStart, LocalTime workEnd) {
        for (BreakPeriod b : breaks) {
            if (b.getStartTime() == null || b.getEndTime() == null) {
                throw new IllegalArgumentException("Each break needs a start and end time");
            }
            if (!b.getStartTime().isBefore(b.getEndTime())) {
                throw new IllegalArgumentException("Break start time must be before its end time");
            }
            if (workStart != null && workEnd != null
                    && (b.getStartTime().isBefore(workStart) || b.getEndTime().isAfter(workEnd))) {
                throw new IllegalArgumentException("Break times must fall within the working hours");
            }
        }
    }

    /** Availability = schedule configured AND at least one free slot within the next 7 days. */
    private boolean computeAvailable(Doctor doctor) {
        if (!ScheduleUtil.scheduleConfigured(doctor)) return false;
        Set<DayOfWeek> days = ScheduleUtil.parseWorkingDays(doctor.getWorkingDays());
        if (days.isEmpty()) return false;

        LocalDate today = LocalDate.now();
        List<Appointment> upcoming = appointmentRepository
                .findByDoctor_DoctorIdAndAppointmentDateGreaterThanEqualAndStatusIn(doctor.getDoctorId(), today, LIVE);
        List<BreakPeriod> breaks = ScheduleUtil.parseBreaks(doctor.getBreaks());
        List<LocalTime> slots = ScheduleUtil.generateSlots(doctor.getStartTime(), doctor.getEndTime(), breaks);
        if (slots.isEmpty()) return false;
        LocalTime now = LocalTime.now();

        for (int i = 0; i < 7; i++) {
            LocalDate date = today.plusDays(i);
            if (!days.contains(date.getDayOfWeek())) continue;
            final LocalDate d = date;
            Set<LocalTime> taken = upcoming.stream()
                    .filter(a -> a.getAppointmentDate().equals(d))
                    .map(Appointment::getAppointmentTime)
                    .collect(Collectors.toSet());
            for (LocalTime slot : slots) {
                if (taken.contains(slot)) continue;
                if (i == 0 && !slot.isAfter(now)) continue;
                return true;
            }
        }
        return false;
    }

    private DoctorResponse toResponse(Doctor doctor) {
        DoctorResponse r = new DoctorResponse();
        r.setDoctorId(doctor.getDoctorId());
        r.setHospitalId(doctor.getHospital().getHospitalId());
        r.setHospitalName(doctor.getHospital().getHospitalName());
        r.setHospitalCity(doctor.getHospital().getCity());
        r.setDoctorName(doctor.getDoctorName());
        r.setEmail(doctor.getEmail());
        r.setQualification(doctor.getQualification());
        r.setSpecialization(doctor.getSpecialization());
        r.setExperience(doctor.getExperience());
        r.setConsultationFee(doctor.getConsultationFee());
        r.setWorkingDays(ScheduleUtil.workingDaysList(doctor.getWorkingDays()));
        r.setStartTime(doctor.getStartTime());
        r.setEndTime(doctor.getEndTime());
        r.setAvailable(computeAvailable(doctor));
        List<BreakPeriod> breaks = ScheduleUtil.parseBreaks(doctor.getBreaks());
        r.setBreaks(breaks);
        r.setOnBreakNow(isOnBreakNow(doctor, breaks));
        r.setCurrentStatus(ScheduleUtil
                .computeCurrentStatus(doctor, LocalDate.now(), LocalTime.now(), breaks)
                .name());
        r.setAverageRating(doctorRatingRepository.findAverageRatingByDoctorId(doctor.getDoctorId()));
        r.setRatingCount(doctorRatingRepository.countByDoctor_DoctorId(doctor.getDoctorId()));
        return r;
    }

    /** True right now if today is a working day and the current time falls inside one of the doctor's breaks. */
    private boolean isOnBreakNow(Doctor doctor, List<BreakPeriod> breaks) {
        if (breaks.isEmpty()) return false;
        LocalDate today = LocalDate.now();
        Set<DayOfWeek> days = ScheduleUtil.parseWorkingDays(doctor.getWorkingDays());
        if (!days.isEmpty() && !days.contains(today.getDayOfWeek())) return false;
        return ScheduleUtil.isWithinBreak(LocalTime.now(), breaks);
    }
}
