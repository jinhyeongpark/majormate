package me.majormate.user.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.service.CharacterService;
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
        user.updateProfile(req.nickname(), req.major(), req.nationality(), req.gender());
        userRepository.save(user);
        return ProfileResponse.of(user, characterService.getCharacter(user));
    }
}
