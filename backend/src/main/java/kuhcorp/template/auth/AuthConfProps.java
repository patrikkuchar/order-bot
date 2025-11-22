package kuhcorp.template.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "auth")
@Component
@Validated
@Data
public class AuthConfProps {

    @NotEmpty
    private String secret;

    @NotNull
    @Valid
    private Session session;

    @Data
    public static class Session {


        @Min(1)
        Long ttlSeconds;

    }
}
