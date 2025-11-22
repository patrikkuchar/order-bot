package kuhcorp.template.domain.test;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kuhcorp.template.api.BadRequestApiException;
import kuhcorp.template.auth.userHolder.RequestUserHolder;
import kuhcorp.template.domain.test.TestDtos.TestEntityDto;
import kuhcorp.template.domain.test.TestDtos.TestEntityRes;
import kuhcorp.template.domain.test.TestDtos.TestRes;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static kuhcorp.template.api.ApiRoutes.PRIVATE_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "test")
@RestController
@RequestMapping(value = PRIVATE_API_PREFIX + "/test", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TestRestApi {

    private final RequestUserHolder holder;
    private final TestService svc;

    @GetMapping("/ping")
    @Operation(operationId = "ping")
    public TestRes ping() {
        var user = holder.getMaybeUser();
        if (user.isEmpty()) {
            throw new BadRequestApiException("User is not authenticated");
        }
        var u = user.get();
        return TestRes.of(String.format("%s %s", u.getFirstName(), u.getLastName()),
                holder.isAdmin());
    }

    @GetMapping("/get")
    @Operation(operationId = "getEntity")
    public TestEntityRes get() {
        return svc.get(holder.getUserId());
    }

    @PostMapping("/update")
    @Operation(operationId = "updateEntity")
    public void update(@RequestBody TestEntityDto req) {
        svc.update(req, holder.getUserId());
    }
}
