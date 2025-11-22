package kuhcorp.template.auth.provider.custom;

import kuhcorp.template.api.BadRequestApiError;
import kuhcorp.template.auth.*;
import kuhcorp.template.auth.provider.custom.AuthDtos.*;
import kuhcorp.template.data.HashEncoder;
import kuhcorp.template.domain.user.User;
import kuhcorp.template.domain.user.UserService;
import kuhcorp.template.etc.time.AppClock;
import lombok.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Component
public class AuthService {

    private final HashEncoder encoder;
    private final UserService svc;
    private final AppClock clock;
    private final AuthConfProps props;
    private final TokenCodec codec;

    @Transactional
    public LoginRes startLogin(LoginReq req) {
        var user = svc.getOptByEmail(req.getEmail())
                .flatMap(u -> validatePassword(u, req.getPassword()))
                .orElseThrow(LoginUnauthorizedException::new);

        var exp = clock.now().plusSeconds(props.getSession().getTtlSeconds());
        var authToken = createToken(user);

        var token = codec.encode(authToken, exp);

        return LoginRes.of(token, LoginRes.UserInfo.builder()
                .email(user.getEmail())
                .meno(user.getFirstName())
                .priezvisko(user.getLastName())
                .role(getRole(user))
                .build());
    }

    @Transactional
    public RegisterUniqueEmailRes isEmailUnique(RegisterUniqueEmailReq req) {
        var isUnique = !svc.existsByEmail(req.getEmail());
        return RegisterUniqueEmailRes.of(isUnique);
    }

    @Transactional
    public void register(RegisterReq req) {
        if (svc.existsByEmail(req.getEmail())) {
            throw new EmailAlreadyInUseException();
        }
        var passwordHash = encoder.encode(req.getPassword());
        svc.create(req, passwordHash);
    }

    private Optional<User> validatePassword(User u, String reqPassword) {
        if (encoder.matches(reqPassword, u.getPasswordHash())) {
            return Optional.of(u);
        }
        return Optional.empty();
    }

    private UserRole getRole(User u) {
        if (u.getIsAdmin()) {
            return UserRole.ADMIN;
        }
        return UserRole.USER;
    }

    private AuthToken createToken(User u) {
        var role = getRole(u);
        return AuthToken.tokenFor(u.getId(), List.of(role.getRoleId()));
    }

    @BadRequestApiError(value = "WRONG_LOGIN_DATA")
    private static class LoginUnauthorizedException extends RuntimeException {
        public LoginUnauthorizedException() {
            super("Wrong login data");
        }
    }

    @BadRequestApiError(value = "EMAIL_ALREADY_IN_USE")
    private static class EmailAlreadyInUseException extends RuntimeException {
        public EmailAlreadyInUseException() {
            super("Email already in use");
        }
    }
}
