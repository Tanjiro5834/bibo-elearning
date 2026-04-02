package com.bibo.elearning.lesson.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.lesson.entity.Subject;
import java.util.List;
import java.util.Optional;
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByActiveTrue();

    List<Subject> findByActive(boolean active);

    boolean existsByNameIgnoreCase(String name);

    Optional<Subject> findByNameIgnoreCase(String name);
}
