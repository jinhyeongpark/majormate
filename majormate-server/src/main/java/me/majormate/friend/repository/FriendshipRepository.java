package me.majormate.friend.repository;

import me.majormate.friend.domain.Friendship;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    boolean existsByRequesterAndAddressee(User requester, User addressee);

    @Query("SELECT f FROM Friendship f WHERE f.requester = :user OR f.addressee = :user")
    List<Friendship> findAllByUser(@Param("user") User user);
}
