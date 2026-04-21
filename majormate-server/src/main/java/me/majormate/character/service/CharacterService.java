package me.majormate.character.service;

import lombok.RequiredArgsConstructor;
import me.majormate.character.domain.CharacterLayer;
import me.majormate.character.dto.CharacterResponse;
import me.majormate.character.dto.CharacterUpdateRequest;
import me.majormate.character.repository.CharacterRepository;
import me.majormate.user.domain.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterRepository characterRepository;

    @Transactional(readOnly = true)
    public CharacterResponse getCharacter(User user) {
        return characterRepository.findByUser(user)
                .map(CharacterResponse::from)
                .orElse(CharacterResponse.from(null));
    }

    @Transactional
    public CharacterResponse updateCharacter(User user, CharacterUpdateRequest req) {
        CharacterLayer layer = characterRepository.findByUser(user)
                .orElseGet(() -> CharacterLayer.builder().user(user).gender("male").build());

        layer.update(req.bottom(), req.top(), req.shoes(), req.hair(),
                req.bag(), req.glasses(), req.item(), req.gender());
        return CharacterResponse.from(characterRepository.save(layer));
    }
}
