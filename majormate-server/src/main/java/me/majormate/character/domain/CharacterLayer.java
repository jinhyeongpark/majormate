package me.majormate.character.domain;

import jakarta.persistence.*;
import lombok.*;
import me.majormate.user.domain.User;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "character_layers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class CharacterLayer {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column private String bottom;
    @Column private String top;
    @Column private String shoes;
    @Column private String hair;
    @Column private String bag;
    @Column private String glasses;
    @Column private String item;
    @Column(nullable = false, length = 10) private String gender;

    public void update(String bottom, String top, String shoes, String hair,
                       String bag, String glasses, String item, String gender) {
        if (bottom != null)  this.bottom = bottom;
        if (top != null)     this.top = top;
        if (shoes != null)   this.shoes = shoes;
        if (hair != null)    this.hair = hair;
        if (bag != null)     this.bag = bag;
        if (glasses != null) this.glasses = glasses;
        if (item != null)    this.item = item;
        if (gender != null)  this.gender = gender;
    }
}
