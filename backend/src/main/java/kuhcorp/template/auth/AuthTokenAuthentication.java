package kuhcorp.template.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static java.util.stream.Collectors.toList;

public class AuthTokenAuthentication extends AbstractAuthenticationToken {

    private final AuthToken token;

    public AuthTokenAuthentication(AuthToken token) {
        super(token.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(toList()));
        this.token = token;

    }

    public AuthToken getToken() {
        return token;
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return token;
    }

    @Override
    public boolean isAuthenticated() {
        return true;
    }
}
