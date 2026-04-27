package me.majormate.character.repository;

import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.ItemCategory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CharacterItemRepository extends JpaRepository<CharacterItem, UUID> {
    List<CharacterItem> findByCategory(ItemCategory category);
    List<CharacterItem> findAll(Sort sort);
    boolean existsByFilePath(String filePath);
}
