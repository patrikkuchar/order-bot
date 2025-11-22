package kuhcorp.orderbot.auth.provider.custom;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.auth.UserRole;
import kuhcorp.orderbot.domain.etc.validation.Email;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;
import lombok.Value;

public class AuthDtos {

    @Data
    public static class LoginReq {

        @NotEmpty
        private String email;

        @NotEmpty
        private String password;

    }

    @Value(staticConstructor = "of")
    public static class LoginRes {

        @NotNull
        String token;

        @NotNull
        UserInfo userInfo;

        @Value
        @Builder
        public static class UserInfo {

            @NotNull
            @NonNull
            String email;

            String meno;

            String priezvisko;

            @NotNull
            @NonNull
            UserRole role;
        }
    }

    @Data
    public static class RegisterUniqueEmailReq {

        @NotEmpty
        private String email;
    }

    @Value(staticConstructor = "of")
    public static class RegisterUniqueEmailRes {

        @NotNull
        Boolean isUnique;
    }

    @Data
    @Builder
    public static class RegisterReq {

        @NotEmpty
        @Email
        private String email;

        @NotEmpty
        private String password;

        @NotEmpty
        private String firstName;

        @NotEmpty
        private String lastName;
    }
}
