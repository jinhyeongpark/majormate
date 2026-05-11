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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
        String email;
        if (principal instanceof OAuth2AuthenticationToken auth) {
            email = auth.getPrincipal().getAttribute("email");
        } else if (principal instanceof UsernamePasswordAuthenticationToken auth
                   && auth.getPrincipal() instanceof OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
        } else {
            throw new IllegalStateException("Unsupported principal: " + principal.getClass());
        }
        return userService.getByEmail(email);
    }
}
