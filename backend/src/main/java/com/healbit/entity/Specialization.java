package com.healbit.entity;

import jakarta.persistence.*;

/**
 * Master list of doctor specializations. Managed by admins so the hospital-facing "add doctor"
 * form can populate its Specialization dropdown dynamically instead of a hardcoded list.
 */
@Entity
@Table(name = "specializations")
public class Specialization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long specializationId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean deleted = false;

    public Long getSpecializationId() { return specializationId; }
    public void setSpecializationId(Long specializationId) { this.specializationId = specializationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
