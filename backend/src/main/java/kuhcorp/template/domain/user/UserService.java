package kuhcorp.template.domain.user;

import kuhcorp.template.auth.provider.custom.AuthDtos;
import kuhcorp.template.auth.provider.custom.AuthDtos.RegisterReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserService {

    private final UserRepo repo;

    public User get(String id) {
        return repo.getActiveById(id);
    }

    public Optional<User> getOptByEmail(String email) {
        return repo.findByEmail(email);
    }

    public Boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    public void create(RegisterReq req, String passwordHash) {
        var u = User.create(req, passwordHash);
        repo.save(u);
    }
}
