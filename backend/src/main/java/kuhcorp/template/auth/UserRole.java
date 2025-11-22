package kuhcorp.template.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static kuhcorp.template.auth.UserRole.RoleConstants.ADMIN_ROLE;
import static kuhcorp.template.auth.UserRole.RoleConstants.USER_ROLE;

@RequiredArgsConstructor
@Schema(enumAsRef = true)
public enum UserRole {

    USER(USER_ROLE, false),
    ADMIN(ADMIN_ROLE, true);

    public static UserRole fromRoleId(String roleId) {
        for (UserRole role : values()) {
            if (role.getRoleId().equals(roleId)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role ID: " + roleId);
    }

    @Getter
    private final String roleId;

    @Getter
    private final boolean isAdmin;

    public static class RoleConstants {

        public static final String USER_ROLE = "APP_USER";

        public static final String ADMIN_ROLE = "ADMIN_USER";
    }
}
