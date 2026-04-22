package me.majormate.friend.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.friend.domain.Friendship;
import me.majormate.friend.dto.AddFriendRequest;
import me.majormate.friend.dto.FriendCodeResponse;
import me.majormate.friend.dto.FriendResponse;
import me.majormate.friend.repository.FriendshipRepository;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final StudyStatusProvider studyStatusProvider;

    public FriendCodeResponse getMyFriendCode(User user) {
        return new FriendCodeResponse(user.getFriendCode());
    }

    @Transactional(readOnly = true)
    public List<FriendResponse> getFriends(User user) {
        return friendshipRepository.findAllByUser(user).stream()
                .map(f -> {
                    User friend = f.getRequester().getId().equals(user.getId())
                            ? f.getAddressee()
                            : f.getRequester();
                    return toResponse(friend);
                })
                .toList();
    }

    @Transactional
    public FriendResponse addFriend(User user, AddFriendRequest req) {
        User target = userRepository.findByFriendCode(req.friendCode())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 친구 코드: " + req.friendCode()));

        if (target.getId().equals(user.getId())) {
            throw new IllegalArgumentException("자기 자신을 친구로 추가할 수 없습니다.");
        }

        boolean alreadyConnected = friendshipRepository.existsByRequesterAndAddressee(user, target)
                || friendshipRepository.existsByRequesterAndAddressee(target, user);

        if (!alreadyConnected) {
            friendshipRepository.save(Friendship.builder()
                    .requester(user)
                    .addressee(target)
                    .build());
        }

        return toResponse(target);
    }

    private FriendResponse toResponse(User friend) {
        return new FriendResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getMajor(),
                studyStatusProvider.getStatus(friend.getId()),
                studyStatusProvider.getKeyword(friend.getId())
        );
    }
}
