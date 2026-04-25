package me.majormate.major.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "majors")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Major {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nameKo;

    @Column(nullable = false, unique = true)
    private String nameEn;

    @Column(nullable = false)
    private String category;
}
