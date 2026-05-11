package me.majormate.point.service;

import lombok.RequiredArgsConstructor;
import me.majormate.common.exception.BadRequestException;
import me.majormate.common.exception.EntityNotFoundException;
import me.majormate.point.domain.UserPoint;
import me.majormate.point.dto.IapWebhookRequest;
import me.majormate.point.dto.PointsResponse;
import me.majormate.point.repository.UserPointRepository;
import me.majormate.user.domain.User;
import me.majormate.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPointService {

    private static final Map<String, Long> PRODUCT_POINT_MAP = Map.of(
            "points_1000", 1000L,
            "points_5000", 5500L,
            "points_10000", 12000L
    );

    private final UserPointRepository userPointRepository;
    private final UserRepository userRepository;

    /**
     * 온보딩(프로필 업데이트) 완료 시 UserPoint 를 처음 한 번 생성한다.
     * 이미 존재하는 경우 아무것도 하지 않는다.
     */
    @Transactional
    public void initializeIfAbsent(User user) {
        if (userPointRepository.findByUser(user).isPresent()) {
            return;
        }
        userPointRepository.save(UserPoint.builder().user(user).balance(0L).build());
    }

    @Transactional(readOnly = true)
    public PointsResponse getBalance(User user) {
        UserPoint userPoint = userPointRepository.findByUser(user)
                .orElse(UserPoint.builder().user(user).balance(0L).build());
        return new PointsResponse(userPoint.getBalance());
    }

    /**
     * IAP 영수증 검증 후 포인트를 충전한다.
     *
     * MVP 스켈레톤: 실제 스토어 API 연동 없이 영수증 수락 구조만 완성한다.
     */
    @Transactional
    public PointsResponse processIap(IapWebhookRequest req) {
        Long amount = PRODUCT_POINT_MAP.get(req.productId());
        if (amount == null) {
            throw new BadRequestException("알 수 없는 productId: " + req.productId());
        }

        // TODO: 실제 영수증 검증 로직 구현
        // - ANDROID: Google Play Developer API 호출 → purchases.products.get
        // - IOS: App Store Server API 호출 → /inApps/v1/verifyReceipt (또는 StoreKit2 JWS)
        // 검증 실패 시 BadRequestException 또는 별도 예외 throw
        validateReceipt(req.platform(), req.receiptData());

        UUID userId = parseUserId(req.userId());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + req.userId()));

        UserPoint userPoint = userPointRepository.findByUser(user)
                .orElseGet(() -> UserPoint.builder().user(user).balance(0L).build());

        userPoint.add(amount);
        userPointRepository.save(userPoint);

        return new PointsResponse(userPoint.getBalance());
    }

    @SuppressWarnings("unused")
    private void validateReceipt(String platform, String receiptData) {
        // TODO: 스토어별 영수증 검증 구현
    }

    private UUID parseUserId(String userId) {
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("유효하지 않은 userId 형식: " + userId);
        }
    }
}
