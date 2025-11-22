package kuhcorp.orderbot.domain.configuration.domain;

import java.util.Optional;

public interface DomainGuard {

    boolean isDomainAllowed(Optional<String> userId);
}
