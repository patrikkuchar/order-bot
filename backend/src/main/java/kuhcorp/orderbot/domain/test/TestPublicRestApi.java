package kuhcorp.orderbot.domain.test;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kuhcorp.orderbot.api.PageDto;
import kuhcorp.orderbot.api.PageReq;
import kuhcorp.orderbot.domain.test.TestDtos.TestItemDto;
import kuhcorp.orderbot.domain.test.TestRepo.TestItemListFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static kuhcorp.orderbot.api.ApiRoutes.PUBLIC_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "test")
@RestController
@RequestMapping(value = PUBLIC_API_PREFIX + "/test", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TestPublicRestApi {

    private final TestService svc;

    @GetMapping("/list-with-page")
    @Operation(operationId = "listEntitiesWithPaging")
    public PageDto<TestItemDto> list(TestItemListFilter filter, @Valid PageReq req) {
        return PageDto.of(svc.list(req, filter));
    }

    @GetMapping("/list-top")
    @Operation(operationId = "listTopEntities")
    public List<TestItemDto> listTop() {
        return svc.listTop();
    }
}
