package kuhcorp.orderbot.domain.configuration;

import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.configuration.domain.DomainGuardRegistry;
import kuhcorp.orderbot.domain.configuration.domain.Domains;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ConfigurationService {

    private final DomainGuardRegistry domainRegistry;

    public ConfigurationRes getConfig(Optional<String> userId) {
        return ConfigurationRes.builder()
                .appVersion("1.0.0")
                .reloadIntervalMs(300_000L)
                .enabledDomains(domainRegistry.getEnabledDomains(userId))
                .build();
    }

    @Getter
    @Builder
    public static class ConfigurationRes {
        @NotNull
        @NonNull
        private String appVersion;
        @NotNull
        @NonNull
        private Long reloadIntervalMs;
        @NotNull
        @NonNull
        private Collection<Domains> enabledDomains;
    }
}
