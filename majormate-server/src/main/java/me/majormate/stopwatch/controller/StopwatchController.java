package me.majormate.stopwatch.controller;

import lombok.RequiredArgsConstructor;
import me.majormate.stopwatch.dto.StartStopwatchRequest;
import me.majormate.stopwatch.dto.UpdateKeywordRequest;
import me.majormate.stopwatch.service.StopwatchService;
import me.majormate.user.domain.User;
import me.majormate.user.service.UserService;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class StopwatchController {

    private final StopwatchService stopwatchService;
    private final UserService userService;

    @MessageMapping("/stopwatch.start")
    public void start(@Payload StartStopwatchRequest req, Principal principal) {
        stopwatchService.start(resolve(principal), req);
    }

    @MessageMapping("/stopwatch.pause")
    public void pause(Principal principal) {
        stopwatchService.pause(resolve(principal));
    }

    @MessageMapping("/stopwatch.resume")
    public void resume(Principal principal) {
        stopwatchService.resume(resolve(principal));
    }

    @MessageMapping("/stopwatch.end")
    public void end(Principal principal) {
        stopwatchService.end(resolve(principal));
    }

    @MessageMapping("/stopwatch.keyword")
    public void updateKeyword(@Payload UpdateKeywordRequest req, Principal principal) {
        stopwatchService.updateKeyword(resolve(principal), req.keyword());
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception e) {
        return e.getMessage();
    }

    private User resolve(Principal principal) {
        OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken) principal;
        return userService.getByEmail(auth.getPrincipal().getAttribute("email"));
    }
}
