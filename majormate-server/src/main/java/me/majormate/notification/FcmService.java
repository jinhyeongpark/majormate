package me.majormate.notification;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import me.majormate.user.domain.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class FcmService {

    public void sendNotification(String token, String title, String body) {
        if (FirebaseApp.getApps().isEmpty()) {
            log.info("[FCM-NOOP] to={} title={}", token, title);
            return;
        }
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            FirebaseMessaging.getInstance().send(message);
        } catch (Exception e) {
            log.warn("[FCM] send failed for token {}: {}", token, e.getMessage());
        }
    }

    public void sendToUsers(List<User> users, String title, String body) {
        users.stream()
                .filter(u -> u.getFcmToken() != null)
                .forEach(u -> sendNotification(u.getFcmToken(), title, body));
    }
}
