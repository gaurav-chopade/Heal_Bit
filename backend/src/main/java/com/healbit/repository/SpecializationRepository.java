package com.healbit.repository;

import com.healbit.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {

    List<Specialization> findAllByDeletedFalseOrderByNameAsc();

    Optional<Specialization> findByNameIgnoreCaseAndDeletedFalse(String name);

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);

    /**
     * Looks up a specialization by name regardless of its deleted flag. The `name` column has a
     * single global unique constraint (see Specialization entity), so this is what must be
     * checked before every insert to decide between "reject as duplicate" and "restore the
     * soft-deleted row" — see SpecializationService#add.
     */
    Optional<Specialization> findByNameIgnoreCase(String name);

    Optional<Specialization> findBySpecializationIdAndDeletedFalse(Long id);
}
