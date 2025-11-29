package kuhcorp.orderbot.domain.template;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateCreateReq;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateDetail;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateListRes;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static kuhcorp.orderbot.api.ApiRoutes.PRIVATE_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "templateManager")
@RestController
@RequestMapping(value = PRIVATE_API_PREFIX + "/template/manager", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class TemplateManagerRestApi {

    private final TemplateManagerService svc;

    @PostMapping("/create")
    public void createTemplate(@RequestBody @Valid TemplateCreateReq req) {
        svc.createTemplate(req);
    }

    @GetMapping("/list")
    public List<TemplateListRes> listTemplates() {
        return svc.listTemplates();
    }

    @GetMapping("/detail/{id}")
    public TemplateDetail getTemplateById(@PathVariable @NotNull String id) {
        return svc.getTemplateById(id);
    }
}
