package com.healbit.dto;

import jakarta.validation.constraints.NotNull;

public class LeaveDecisionRequest {
    @NotNull private Boolean approved;
    public Boolean getApproved() { return approved; } public void setApproved(Boolean approved) { this.approved = approved; }
}
