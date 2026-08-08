package com.healbit.exception;

public class HospitalNotApprovedException extends RuntimeException {
    public HospitalNotApprovedException(String message) {
        super(message);
    }
}
