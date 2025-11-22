package kuhcorp.orderbot.auth.provider.custom;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import kuhcorp.orderbot.auth.AuthToken;
import kuhcorp.orderbot.auth.AuthToken.ExpiredTokenException;
import kuhcorp.orderbot.auth.AuthToken.InvalidTokenException;
import kuhcorp.orderbot.auth.TokenCodec;
import kuhcorp.orderbot.etc.time.AppClock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Map;

import static java.util.stream.Collectors.toMap;

@RequiredArgsConstructor
@Slf4j
public class JwtTokenCodec implements TokenCodec {

    private final SecretKey key;
    private final AppClock clock;

    public JwtTokenCodec(String secret, AppClock clock) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.clock = clock;
    }

    @Override
    public String encode(AuthToken token, Instant exp) {
        var claims = token.getClaims();

        return Jwts.builder()
                .header().add("typ", "JWT")
                .and()
                .claims(claims)
                .subject(token.getSubject())
                .issuedAt(clock.nowDate())
                .expiration(clock.toDate(exp))
                .signWith(key)
                .compact();
    }

    @Override
    public AuthToken decode(String token) throws InvalidTokenException, ExpiredTokenException {
        Jws<Claims> jwt;
        try {
            jwt = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
        } catch (ExpiredJwtException e) {
            log.debug("Expired jwt token {}", token, e);
            throw new ExpiredTokenException(e);
        } catch (JwtException e) {
            log.debug("Invalid jwt token {}", token, e);
            throw new InvalidTokenException(e);
        }

        var claims = jwt.getBody();

        return fromClaims(claims);
    }

    private AuthToken fromClaims(Claims claims) {
        var tokenClaims = claims.entrySet().stream()
                .collect(toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().toString()
                ));

        return AuthToken.tokenFor(claims.getSubject(), tokenClaims);
    }
}
