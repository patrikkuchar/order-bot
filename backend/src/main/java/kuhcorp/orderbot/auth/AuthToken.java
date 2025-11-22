package kuhcorp.orderbot.auth;

import lombok.Getter;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;

public class AuthToken {

    @Getter
    private String subject;
    @Getter
    private Map<String, String> claims;

    public static String ROLES_KEY = "roles";

    public static AuthToken tokenFor(String subject,
                                     Collection<String> roles) {
        var claims = Map.of(ROLES_KEY, String.join(",", roles));
        return tokenFor(subject, claims);
    }

    public static AuthToken tokenFor(String subject,
                                     Map<String, String> claims) {
        var t = new AuthToken();
        t.subject = subject;
        t.claims = Map.copyOf(claims);
        return t;
    }

    public Collection<String> getRoles() {
        var roles = claims.get(ROLES_KEY);

        if (roles == null)
            throw new NoSuchElementException("Token does not contain roles info");

        return Arrays.asList(roles.split(","));
    }

    @AuthUnauthorizedError(value = "AUTH_INVALID_CREDENTIALS")
    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }

        public InvalidTokenException(Throwable cause) {
            super(cause);
        }
    }

    @AuthUnauthorizedError(value = "AUTH_EXPIRED_TOKEN")
    public static class ExpiredTokenException extends RuntimeException {
        public ExpiredTokenException(String message) {
            super(message);
        }

        public ExpiredTokenException(Throwable cause) {
            super(cause);
        }
    }
}
