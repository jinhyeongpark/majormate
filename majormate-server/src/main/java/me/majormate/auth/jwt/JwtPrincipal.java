package me.majormate.auth.jwt;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * OAuth2User adapter for JWT-authenticated requests.
 * Existing controllers resolve the user via getAttribute("email"), which this satisfies.
 */
public class JwtPrincipal implements OAuth2User {

    private final Map<String, Object> attributes;

    public JwtPrincipal(String email) {
        this.attributes = Map.of("email", email);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return (String) attributes.get("email");
    }
}
