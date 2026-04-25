package me.majormate.auth.service;

import lombok.RequiredArgsConstructor;
import me.majormate.auth.dto.GoogleAuthResponse;
import me.majormate.auth.jwt.JwtUtil;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MobileGoogleAuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Transactional
    public GoogleAuthResponse authenticate(String accessToken) {
        Map<String, Object> info = fetchUserInfo(accessToken);

        Boolean emailVerified = Boolean.valueOf(String.valueOf(info.get("email_verified")));
        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email not verified");
        }

        String email = (String) info.get("email");
        String name  = (String) info.get("name");

        Optional<User> existing = userRepository.findByEmail(email);
        boolean isNewUser = existing.isEmpty();
        if (isNewUser) {
            userRepository.save(User.ofOAuth2(email, name));
        }

        return new GoogleAuthResponse(jwtUtil.generate(email), isNewUser);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        try {
            return restTemplate.exchange(
                    USERINFO_URL,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            ).getBody();
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google access token");
        }
    }
}
