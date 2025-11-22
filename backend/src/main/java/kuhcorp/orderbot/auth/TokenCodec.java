package kuhcorp.orderbot.auth;

import java.time.Instant;

import static kuhcorp.orderbot.auth.AuthToken.*;

public interface TokenCodec {

    String encode(AuthToken token, Instant exp);

    AuthToken decode(String token) throws InvalidTokenException, ExpiredTokenException;

}
