package kuhcorp.template.domain.user;

import kuhcorp.template.db.Repo;

import java.util.Optional;

import static kuhcorp.template.domain.user.QUser.user;

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
