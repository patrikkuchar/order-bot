package kuhcorp.template.db;

import kuhcorp.template.auth.CurrentUserHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuditorAwareImpl implements AuditorAware<String> {

    private final CurrentUserHolder holder;

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.of(holder.getUsername());
    }
}
