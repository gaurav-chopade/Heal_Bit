package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.PaymentOrderResponse;
import com.healbit.dto.PaymentVerifyRequest;
import com.healbit.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** Patient starts payment for one of their appointments -> returns a Razorpay order. */
    @PostMapping("/appointments/{id}/order")
    public ResponseEntity<PaymentOrderResponse> order(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.createOrder(principal.getId(), id));
    }

    /** Patient submits the checkout result; the signature is verified before marking paid. */
    @PostMapping("/appointments/{id}/verify")
    public ResponseEntity<ApiResponse> verify(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verify(principal.getId(), id, request));
    }
}
