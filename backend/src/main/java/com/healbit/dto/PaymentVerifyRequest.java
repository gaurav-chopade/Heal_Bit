package com.healbit.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentVerifyRequest {
    @NotBlank private String razorpayOrderId;
    @NotBlank private String razorpayPaymentId;
    @NotBlank private String razorpaySignature;

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String v) { this.razorpayOrderId = v; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String v) { this.razorpayPaymentId = v; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String v) { this.razorpaySignature = v; }
}
