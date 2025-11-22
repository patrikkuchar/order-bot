package kuhcorp.template.domain.configuration;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kuhcorp.template.auth.userHolder.RequestUserHolder;
import kuhcorp.template.domain.configuration.ConfigurationService.ConfigurationRes;
import kuhcorp.template.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kuhcorp.template.api.ApiRoutes.PUBLIC_API_PREFIX;
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
