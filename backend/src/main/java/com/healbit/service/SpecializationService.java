package com.healbit.service;

import com.healbit.dto.SpecializationRequest;
import com.healbit.dto.SpecializationResponse;
import com.healbit.entity.Specialization;
import com.healbit.exception.DuplicateResourceException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.SpecializationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class SpecializationService {

    private final SpecializationRepository specializationRepository;

    public SpecializationService(SpecializationRepository specializationRepository) {
        this.specializationRepository = specializationRepository;
    }

    /** Public: the live, dynamic list of specializations shown in dropdowns. */
    public List<SpecializationResponse> list() {
        return specializationRepository.findAllByDeletedFalseOrderByNameAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Admin: add a new specialization to the master table.
     *
     * Root cause of the "Duplicate entry ... for key specializations.UK..." crash: the `name`
     * column carries a single global unique constraint (it does not know about the `deleted`
     * flag), but this method used to only check for a collision among *active*
     * (deleted = false) rows before inserting. Deleting "Pediatrics" leaves its row in the table
     * with deleted = true; re-adding "Pediatrics" then passed the active-only check and tried to
     * INSERT a second row with the same name, which the database rejected with a raw SQL
     * exception that bubbled up to the user as "Something went wrong: ...".
     *
     * Fix: look up the name ignoring the deleted flag. If a row already exists:
     *   - active  -> it's a genuine duplicate, reject with a friendly message.
     *   - deleted -> restore that row instead of inserting a new one (no second row is ever
     *                created, so the unique constraint can never be violated here).
     * Only when no row exists at all do we insert a brand new one.
     */
    public SpecializationResponse add(SpecializationRequest request) {
        String name = request.getName().trim();
        return specializationRepository.findByNameIgnoreCase(name)
                .map(existing -> {
                    if (!existing.isDeleted()) {
                        throw new DuplicateResourceException("This specialization already exists");
                    }
                    // Previously removed specialization with the same name: restore it rather
                    // than inserting a duplicate row (that row would collide on the unique key).
                    existing.setName(name);
                    existing.setDeleted(false);
                    return toResponse(specializationRepository.save(existing));
                })
                .orElseGet(() -> {
                    Specialization s = new Specialization();
                    s.setName(name);
                    return toResponse(specializationRepository.save(s));
                });
    }

    /** Admin: rename an existing specialization. */
    public SpecializationResponse update(Long id, SpecializationRequest request) {
        Specialization s = specializationRepository.findBySpecializationIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id " + id));
        String name = request.getName().trim();
        if (!name.equalsIgnoreCase(s.getName())) {
            // Check against ALL rows (active or soft-deleted), not just active ones, since the
            // unique constraint is global — renaming into a soft-deleted row's name would hit
            // the exact same duplicate-key failure described above.
            specializationRepository.findByNameIgnoreCase(name).ifPresent(other -> {
                if (!other.getSpecializationId().equals(s.getSpecializationId())) {
                    throw new DuplicateResourceException("This specialization already exists");
                }
            });
        }
        s.setName(name);
        return toResponse(specializationRepository.save(s));
    }

    /** Admin: remove a specialization from the master table (soft delete). */
    public void delete(Long id) {
        Specialization s = specializationRepository.findBySpecializationIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id " + id));
        s.setDeleted(true);
        specializationRepository.save(s);
    }

    private SpecializationResponse toResponse(Specialization s) {
        return new SpecializationResponse(s.getSpecializationId(), s.getName());
    }
}
