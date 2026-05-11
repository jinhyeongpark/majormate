package me.majormate.character.repository;

import me.majormate.character.domain.CharacterItem;
import me.majormate.character.domain.UserItem;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface UserItemRepository extends JpaRepository<UserItem, UUID> {
    List<UserItem> findByUser(User user);
    boolean existsByUserAndItem(User user, CharacterItem item);

    @Query("SELECT ui.item.id FROM UserItem ui WHERE ui.user = :user")
    Set<UUID> findOwnedItemIds(@Param("user") User user);
}
