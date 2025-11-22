package kuhcorp.orderbot.domain.user;

import kuhcorp.orderbot.db.Repo;

import java.util.Optional;

import static kuhcorp.orderbot.domain.user.QUser.user;

public interface UserRepo extends Repo<User, String> {

    default Optional<User> findByEmail(String email) {
        return fetchOneOptionalActive(
                user.email.eq(email)
        );
    }

    default Boolean existsByEmail(String email) {
        return existsActive(
                user.email.eq(email)
        );
    }
}
