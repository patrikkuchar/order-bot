package kuhcorp.orderbot.domain.configuration;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kuhcorp.orderbot.auth.userHolder.RequestUserHolder;
import kuhcorp.orderbot.domain.configuration.ConfigurationService.ConfigurationRes;
import kuhcorp.orderbot.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kuhcorp.orderbot.api.ApiRoutes.PUBLIC_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "config")
@RestController
@RequestMapping(value = PUBLIC_API_PREFIX + "/config", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class ConfigurationRestApi {

    private final RequestUserHolder holder;
    private final ConfigurationService svc;

    @GetMapping("/")
    @Operation(operationId = "getConfig")
    public ConfigurationRes getConfig() {
        var userId = holder.getMaybeUser().map(User::getId);
        return svc.getConfig(userId);
    }
}
