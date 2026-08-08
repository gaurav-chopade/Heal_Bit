package com.healbit.dto;

public class SpecializationResponse {

    private Long specializationId;
    private String name;

    public SpecializationResponse() {}

    public SpecializationResponse(Long specializationId, String name) {
        this.specializationId = specializationId;
        this.name = name;
    }

    public Long getSpecializationId() { return specializationId; }
    public void setSpecializationId(Long specializationId) { this.specializationId = specializationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
