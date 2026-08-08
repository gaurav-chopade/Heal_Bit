package com.healbit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SpecializationRequest {

    @NotBlank(message = "Specialization name is required")
    @Size(max = 100, message = "Specialization name is too long")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
