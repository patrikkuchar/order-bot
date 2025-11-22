package kuhcorp.orderbot.auth.provider.custom;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kuhcorp.orderbot.auth.provider.custom.AuthDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kuhcorp.orderbot.api.ApiRoutes.AUTH_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "auth")
@RestController
@RequestMapping(value = AUTH_API_PREFIX, produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AuthRestApi {

    private final AuthService svc;

    @PostMapping("/login")
    @Operation(operationId = "login")
    public LoginRes login(@RequestBody @Valid LoginReq req) {
        return svc.startLogin(req);
    }

    @PostMapping("/unique")
    @Operation(operationId = "isEmailUnique")
    public RegisterUniqueEmailRes isEmailUnique(@RequestBody @Valid RegisterUniqueEmailReq req) {
        return svc.isEmailUnique(req);
    }

    @PostMapping("/register")
    @Operation(operationId = "register")
    public void register(@RequestBody @Valid RegisterReq req) {
        svc.register(req);
    }
}
