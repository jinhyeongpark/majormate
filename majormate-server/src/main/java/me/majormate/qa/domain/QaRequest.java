package me.majormate.qa.domain;

import jakarta.persistence.*;
import lombok.*;
import me.majormate.user.domain.User;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "qa_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class QaRequest {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @Column(length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QaRequestStatus status = QaRequestStatus.PENDING;

    @Column(columnDefinition = "uuid")
    private UUID chatRoomId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    private void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void accept() {
        this.status = QaRequestStatus.ACCEPTED;
        this.chatRoomId = UUID.randomUUID();
        this.updatedAt = Instant.now();
    }

    public void reject() {
        this.status = QaRequestStatus.REJECTED;
        this.updatedAt = Instant.now();
    }
}
