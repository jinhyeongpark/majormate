package me.majormate.major.repository;

import me.majormate.major.domain.Major;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MajorRepository extends JpaRepository<Major, Long> {
    boolean existsByNameKo(String nameKo);
}
