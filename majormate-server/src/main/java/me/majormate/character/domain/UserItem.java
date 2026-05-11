package me.majormate.character.domain;

import jakarta.persistence.*;
import lombok.*;
import me.majormate.user.domain.User;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "user_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserItem {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private CharacterItem item;

    @Column(nullable = false)
    @Builder.Default
    private Instant acquiredAt = Instant.now();
}
