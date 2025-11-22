package kuhcorp.template.domain.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum UserStatus {

    ACTIVE(true),
    DISABLED(false);

    @Getter
    private final boolean isActive;
}
