package me.majormate.character.repository;

import me.majormate.character.domain.CharacterLayer;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CharacterRepository extends JpaRepository<CharacterLayer, UUID> {
    Optional<CharacterLayer> findByUser(User user);
}
