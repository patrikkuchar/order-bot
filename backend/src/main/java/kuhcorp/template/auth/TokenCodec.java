package kuhcorp.template.auth;

import java.time.Instant;

import static kuhcorp.template.auth.AuthToken.*;

public interface TokenCodec {

    String encode(AuthToken token, Instant exp);

    AuthToken decode(String token) throws InvalidTokenException, ExpiredTokenException;

}
