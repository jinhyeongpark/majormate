package me.majormate.user.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.service.CharacterService;
import me.majormate.common.exception.BadRequestException;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.major.service.MajorService;
import me.majormate.point.service.UserPointService;
import me.majormate.room.service.RoomService;
import me.majormate.user.domain.User;
import me.majormate.user.dto.ProfileResponse;
import me.majormate.user.dto.ProfileUpdateRequest;
import me.majormate.user.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CharacterService characterService;
    private final MajorService majorService;
    private final UserPointService userPointService;
    @Lazy
    private final RoomService roomService;

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

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
        String prevMajor = user.getMajor();
        String newMajor = req.major();
        user.updateProfile(req.nickname(), newMajor, req.nationality(), req.gender());
        userRepository.save(user);
        if (newMajor != null && !newMajor.equals(prevMajor)) {
            roomService.joinMajorRoomIfAbsent(user, newMajor);
        }
        userPointService.initializeIfAbsent(user);
        return ProfileResponse.of(user, characterService.getCharacter(user));
    }

    @Transactional
    public void updateFcmToken(User user, String token) {
        user.updateFcmToken(token);
        userRepository.save(user);
    }
}
