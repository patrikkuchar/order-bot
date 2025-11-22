package kuhcorp.orderbot.domain.test;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kuhcorp.orderbot.api.BadRequestApiException;
import kuhcorp.orderbot.auth.userHolder.RequestUserHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static kuhcorp.orderbot.api.ApiRoutes.ADMIN_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "test")
@RestController
@RequestMapping(value = ADMIN_API_PREFIX + "/test", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TestAdminRestApi {

    private final RequestUserHolder holder;

    @GetMapping("/ping")
    @Operation(operationId = "adminPing")
    public TestDtos.TestRes ping(@RequestParam(required = false) TestDtos.TestRes param) {
        var user = holder.getMaybeUser();
        if (user.isEmpty()) {
            throw new BadRequestApiException("User is not authenticated");
        }
        var u = user.get();
        return TestDtos.TestRes.of(String.format("%s %s", u.getFirstName(), u.getLastName()),
                holder.isAdmin());
    }
}
