package me.majormate.notification;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;

@Configuration
@Slf4j
public class FirebaseConfig implements InitializingBean {

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    @Override
    public void afterPropertiesSet() {
        if (serviceAccountPath.isBlank()) {
            log.warn("[FCM] FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled.");
            return;
        }
        try (FileInputStream stream = new FileInputStream(serviceAccountPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(stream))
                    .build();
            FirebaseApp.initializeApp(options);
            log.info("[FCM] Firebase initialized.");
        } catch (Exception e) {
            log.error("[FCM] Firebase init failed: {}", e.getMessage());
        }
    }
}
