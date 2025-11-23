package kuhcorp.dataseeding.domain.user;

import kuhcorp.orderbot.data.HashEncoder;
import kuhcorp.orderbot.domain.user.User;
import kuhcorp.orderbot.domain.user.UserRepo;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Component;

import static kuhcorp.orderbot.auth.provider.custom.AuthDtos.*;

@Component
@RequiredArgsConstructor
public class UserDataHelper {

    private final String PASSWORD = "pass123";

    private final HashEncoder encoder;
    private final UserRepo repo;

    public User createAndPersist(SeedUserReq req) {
        var passwordHash = encoder.encode(PASSWORD);
        var u = User.create(req.getId(), createReq(req), passwordHash, req.getIsAdmin());
        repo.saveAndFlush(u);
        return u;
    }

    private RegisterReq createReq(SeedUserReq r) {
        return RegisterReq.builder()
                .email(r.getEmail())
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .password(PASSWORD)
                .build();
    }

    @Builder
    @Value
    public static class SeedUserReq {

        String id;

        String email;

        String firstName;

        String lastName;

        @Builder.Default
        Boolean isAdmin = false;

    }
}
