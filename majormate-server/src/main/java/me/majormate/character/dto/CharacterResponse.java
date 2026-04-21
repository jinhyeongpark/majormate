package me.majormate.character.dto;

import me.majormate.character.domain.CharacterLayer;

public record CharacterResponse(
        String gender,
        String bottom,
        String top,
        String shoes,
        String hair,
        String bag,
        String glasses,
        String item
) {
    public static CharacterResponse from(CharacterLayer layer) {
        if (layer == null) return new CharacterResponse("male", null, null, null, null, null, null, null);
        return new CharacterResponse(
                layer.getGender(),
                layer.getBottom(), layer.getTop(), layer.getShoes(), layer.getHair(),
                layer.getBag(), layer.getGlasses(), layer.getItem());
    }
}
