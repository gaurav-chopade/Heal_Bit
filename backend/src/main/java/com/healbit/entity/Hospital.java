package com.healbit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hospitalId;

    @Column(nullable = false)
    private String hospitalName;

    @Column(nullable = false, unique = true)
    private String registrationNumber;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 10)
    private String phone;

    private String address;

    private String city;

    private String state;

    @Column(length = 6)
    private String pincode;

    @Column(length = 1000)
    private String description;

    /** Legacy: photo kept inline as a base64 data URL (pre-Cloudinary rows). */
    @Column(columnDefinition = "LONGTEXT")
    private String imageData;

    /** Cloudinary-hosted photo (public CDN URL) and its asset id, used for replace/delete. */
    @Column(length = 600)
    private String imageUrl;

    @Column(length = 255)
    private String imagePublicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HospitalStatus status = HospitalStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean deleted = false;

    // Cancellation policy, configurable per hospital.
    // Whether a patient may cancel an appointment the hospital/doctor has already accepted (CONFIRMED).
    @Column(nullable = false)
    private boolean allowCancellationAfterAcceptance = true;

    // Minimum number of hours before the scheduled appointment time that a cancellation must be
    // made by. Null/0 means no minimum-notice restriction.
    private Integer cancellationMinHours;

    @OneToMany(mappedBy = "hospital", fetch = FetchType.LAZY)
    private List<Doctor> doctors = new ArrayList<>();

    @OneToMany(mappedBy = "hospital", fetch = FetchType.LAZY)
    private List<Appointment> appointments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = HospitalStatus.PENDING;
        }
    }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImagePublicId() { return imagePublicId; }
    public void setImagePublicId(String imagePublicId) { this.imagePublicId = imagePublicId; }

    /** The photo to show: the Cloudinary URL when present, else the legacy inline image. */
    public String displayImage() { return imageUrl != null ? imageUrl : imageData; }

    public HospitalStatus getStatus() { return status; }
    public void setStatus(HospitalStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isAllowCancellationAfterAcceptance() { return allowCancellationAfterAcceptance; }
    public void setAllowCancellationAfterAcceptance(boolean allowCancellationAfterAcceptance) {
        this.allowCancellationAfterAcceptance = allowCancellationAfterAcceptance;
    }

    public Integer getCancellationMinHours() { return cancellationMinHours; }
    public void setCancellationMinHours(Integer cancellationMinHours) { this.cancellationMinHours = cancellationMinHours; }

    public List<Doctor> getDoctors() { return doctors; }
    public void setDoctors(List<Doctor> doctors) { this.doctors = doctors; }

    public List<Appointment> getAppointments() { return appointments; }
    public void setAppointments(List<Appointment> appointments) { this.appointments = appointments; }
}
