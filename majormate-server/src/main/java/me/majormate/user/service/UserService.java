package me.majormate.user.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.service.CharacterService;
import me.majormate.common.exception.BadRequestException;
import me.majormate.major.service.MajorService;
import me.majormate.user.domain.User;
import me.majormate.user.dto.ProfileResponse;
import me.majormate.user.dto.ProfileUpdateRequest;
import me.majormate.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CharacterService characterService;
    private final MajorService majorService;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(User user) {
        return ProfileResponse.of(user, characterService.getCharacter(user));
    }

    @Transactional
    public ProfileResponse updateProfile(User user, ProfileUpdateRequest req) {
        if (req.major() != null && !majorService.exists(req.major())) {
            throw new BadRequestException("존재하지 않는 전공입니다: " + req.major());
        }
        user.updateProfile(req.nickname(), req.major(), req.nationality(), req.gender());
        userRepository.save(user);
        return ProfileResponse.of(user, characterService.getCharacter(user));
    }

    @Transactional
    public void updateFcmToken(User user, String token) {
        user.updateFcmToken(token);
        userRepository.save(user);
    }
}
