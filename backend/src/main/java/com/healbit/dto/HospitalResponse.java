package com.healbit.dto;

import com.healbit.entity.HospitalStatus;
import java.time.LocalDateTime;

public class HospitalResponse {

    private Long hospitalId;
    private String hospitalName;
    private String registrationNumber;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String description;
    private String imageUrl;
    private HospitalStatus status;
    private LocalDateTime createdAt;

    // Computed: aggregate rating from patients (null if no ratings yet) and how many ratings.
    private Double averageRating;
    private long ratingCount;

    // Cancellation policy configured by the hospital.
    private boolean allowCancellationAfterAcceptance;
    private Integer cancellationMinHours;

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public long getRatingCount() { return ratingCount; }
    public void setRatingCount(long ratingCount) { this.ratingCount = ratingCount; }

    public boolean isAllowCancellationAfterAcceptance() { return allowCancellationAfterAcceptance; }
    public void setAllowCancellationAfterAcceptance(boolean allowCancellationAfterAcceptance) {
        this.allowCancellationAfterAcceptance = allowCancellationAfterAcceptance;
    }

    public Integer getCancellationMinHours() { return cancellationMinHours; }
    public void setCancellationMinHours(Integer cancellationMinHours) { this.cancellationMinHours = cancellationMinHours; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public HospitalStatus getStatus() { return status; }
    public void setStatus(HospitalStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
