package me.majormate.qa.repository;

import me.majormate.qa.domain.QaRequest;
import me.majormate.qa.domain.QaRequestStatus;
import me.majormate.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QaRequestRepository extends JpaRepository<QaRequest, UUID> {

    List<QaRequest> findByTargetAndStatus(User target, QaRequestStatus status);

    List<QaRequest> findByRequesterAndStatus(User requester, QaRequestStatus status);

    Optional<QaRequest> findByChatRoomId(UUID chatRoomId);
}
