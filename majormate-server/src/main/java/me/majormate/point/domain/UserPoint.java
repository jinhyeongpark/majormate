package me.majormate.point.domain;

import jakarta.persistence.*;
import lombok.*;
import me.majormate.user.domain.User;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_points")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class UserPoint {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private long balance = 0L;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    private void touch() {
        this.updatedAt = Instant.now();
    }

    public void add(long amount) {
        this.balance += amount;
    }

    public void deduct(long amount) {
        this.balance -= amount;
    }
}
