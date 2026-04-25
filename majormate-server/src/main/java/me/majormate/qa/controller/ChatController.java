package me.majormate.qa.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.qa.dto.ChatMessageRequest;
import me.majormate.qa.dto.ChatMessageResponse;
import me.majormate.qa.service.QaService;
import me.majormate.user.service.UserService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final QaService qaService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.{chatRoomId}")
    public void sendMessage(
            @DestinationVariable UUID chatRoomId,
            @Payload ChatMessageRequest req,
            Principal principal) {
        OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken) principal;
        var sender = userService.getByEmail(auth.getPrincipal().getAttribute("email"));
        ChatMessageResponse response = qaService.sendChatMessage(sender, chatRoomId, req.content());
        messagingTemplate.convertAndSend("/topic/chat." + chatRoomId, response);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception e) {
        return e.getMessage();
    }
}
