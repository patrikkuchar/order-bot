package kuhcorp.orderbot.auth;

import kuhcorp.orderbot.auth.AuthToken.InvalidTokenException;
import lombok.NoArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@NoArgsConstructor
public class AuthUserService {

    public boolean isAnonymous() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth instanceof AnonymousAuthenticationToken;
    }

    public boolean hasUserContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null;
    }

    public UserContext getUserContext() {
        var anyAuth = SecurityContextHolder.getContext().getAuthentication();
        if (anyAuth instanceof AuthTokenAuthentication auth) {
            var token = auth.getToken();
            var role = getUserRole(token);
            return new UserContext(token.getSubject(), role);
        }

        throw new NoSessionForRequest();
    }

    private UserRole getUserRole(AuthToken token) {
        var roles = token.getRoles();
        if (roles.size() != 1) {
            throw new InvalidTokenException("Invalid token claims");
        }

        return UserRole.fromRoleId(roles.iterator().next());
    }

    public record UserContext(String userId, UserRole role) {}



    static class NoSessionForRequest extends RuntimeException {

        public NoSessionForRequest() {
            super("No user associated  with the current request");
        }
    }
}
