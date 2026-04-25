package me.majormate.user.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class User {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String nickname;

    @Column
    private String major;

    @Column(length = 2)
    private String nationality;

    @Enumerated(EnumType.STRING)
    @Column
    private Gender gender;

    @Column(unique = true, length = 8)
    private String friendCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Column(length = 512)
    private String fcmToken;

    public static User ofOAuth2(String email, String name) {
        return User.builder()
                .email(email)
                .nickname(name)
                .friendCode(generateFriendCode())
                .build();
    }

    private static String generateFriendCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public void updateProfile(String nickname, String major, String nationality, Gender gender) {
        if (nickname != null)    this.nickname = nickname;
        if (major != null)       this.major = major;
        if (nationality != null) this.nationality = nationality;
        if (gender != null)      this.gender = gender;
    }

    public void updateFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }
}
