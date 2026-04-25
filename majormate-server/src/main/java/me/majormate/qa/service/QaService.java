package me.majormate.qa.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.common.exception.ForbiddenException;
import me.majormate.notification.FcmService;
import me.majormate.qa.domain.ChatMessage;
import me.majormate.qa.domain.QaRequest;
import me.majormate.qa.dto.ChatMessageResponse;
import me.majormate.qa.dto.QaRequestCreateRequest;
import me.majormate.qa.dto.QaRequestResponse;
import me.majormate.qa.repository.ChatMessageRepository;
import me.majormate.qa.repository.QaRequestRepository;
import me.majormate.stopwatch.service.SessionStateService;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QaService {

    private final QaRequestRepository qaRequestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SessionStateService sessionStateService;
    private final FcmService fcmService;

    @Transactional
    public QaRequestResponse createRequest(User requester, QaRequestCreateRequest req) {
        User target = userRepository.findById(req.targetUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + req.targetUserId()));

        if (!sessionStateService.isAllowQuestion(target.getId())) {
            throw new IllegalStateException("현재 질문을 허용하지 않는 사용자입니다.");
        }

        QaRequest qaRequest = qaRequestRepository.save(QaRequest.builder()
                .requester(requester)
                .target(target)
                .message(req.message())
                .build());

        String body = req.message() != null ? req.message() : "질문 요청이 도착했습니다.";
        fcmService.sendToUsers(List.of(target),
                requester.getNickname() + "님이 질문 요청을 보냈어요!", body);

        return toResponse(qaRequest);
    }

    @Transactional
    public QaRequestResponse accept(User target, UUID requestId) {
        QaRequest qaRequest = qaRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("QA request not found: " + requestId));

        if (!qaRequest.getTarget().getId().equals(target.getId())) {
            throw new ForbiddenException();
        }

        qaRequest.accept();

        fcmService.sendToUsers(List.of(qaRequest.getRequester()),
                target.getNickname() + "님이 질문을 수락했어요!", "채팅방이 열렸습니다.");

        return toResponse(qaRequest);
    }

    @Transactional
    public QaRequestResponse reject(User target, UUID requestId) {
        QaRequest qaRequest = qaRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("QA request not found: " + requestId));

        if (!qaRequest.getTarget().getId().equals(target.getId())) {
            throw new ForbiddenException();
        }

        qaRequest.reject();

        fcmService.sendToUsers(List.of(qaRequest.getRequester()),
                target.getNickname() + "님이 질문 요청을 거절했어요.", "");

        return toResponse(qaRequest);
    }

    @Transactional
    public ChatMessageResponse sendChatMessage(User sender, UUID chatRoomId, String content) {
        ChatMessage message = chatMessageRepository.save(ChatMessage.builder()
                .chatRoomId(chatRoomId)
                .sender(sender)
                .content(content)
                .build());

        qaRequestRepository.findByChatRoomId(chatRoomId).ifPresent(req -> {
            User other = req.getRequester().getId().equals(sender.getId())
                    ? req.getTarget()
                    : req.getRequester();
            String preview = content.length() > 50 ? content.substring(0, 50) + "…" : content;
            fcmService.sendToUsers(List.of(other), sender.getNickname() + "님의 새 메시지", preview);
        });

        return toChatResponse(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(UUID chatRoomId) {
        return chatMessageRepository.findByChatRoomIdOrderByCreatedAt(chatRoomId)
                .stream()
                .map(this::toChatResponse)
                .toList();
    }

    private QaRequestResponse toResponse(QaRequest r) {
        return new QaRequestResponse(
                r.getId(),
                r.getRequester().getId(),
                r.getRequester().getNickname(),
                r.getTarget().getId(),
                r.getTarget().getNickname(),
                r.getMessage(),
                r.getStatus().name(),
                r.getChatRoomId(),
                r.getCreatedAt()
        );
    }

    private ChatMessageResponse toChatResponse(ChatMessage m) {
        return new ChatMessageResponse(
                m.getId(),
                m.getChatRoomId(),
                m.getSender().getId(),
                m.getSender().getNickname(),
                m.getContent(),
                m.getCreatedAt()
        );
    }
}
