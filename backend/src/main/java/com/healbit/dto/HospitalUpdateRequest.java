package com.healbit.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public class HospitalUpdateRequest {

    private String hospitalName;

    @Pattern(regexp = "^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    private String address;
    private String city;
    private String state;

    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    private String description;

    private String image;

    // Cancellation policy: whether patients may cancel appointments the hospital has already
    // accepted (CONFIRMED), and the minimum notice (in hours) required to cancel at all.
    private Boolean allowCancellationAfterAcceptance;

    @PositiveOrZero(message = "Minimum cancellation notice cannot be negative")
    private Integer cancellationMinHours;

    public Boolean getAllowCancellationAfterAcceptance() { return allowCancellationAfterAcceptance; }
    public void setAllowCancellationAfterAcceptance(Boolean allowCancellationAfterAcceptance) {
        this.allowCancellationAfterAcceptance = allowCancellationAfterAcceptance;
    }

    public Integer getCancellationMinHours() { return cancellationMinHours; }
    public void setCancellationMinHours(Integer cancellationMinHours) { this.cancellationMinHours = cancellationMinHours; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

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

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
