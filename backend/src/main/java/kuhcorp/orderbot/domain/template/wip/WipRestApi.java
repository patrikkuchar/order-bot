package kuhcorp.orderbot.domain.template.wip;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kuhcorp.orderbot.api.CommonDtos.StringDto;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.*;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static kuhcorp.orderbot.api.ApiRoutes.PRIVATE_API_PREFIX;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Tag(name = "wipTemplateMng")
@RestController
@RequestMapping(value = PRIVATE_API_PREFIX + "/template/manager/wip", produces = APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class WipRestApi {

    private final WipSessionService sessionSvc;

    @PostMapping("/session/{templateId}")
    public StringDto getSession(@PathVariable String templateId) {
        return StringDto.of(sessionSvc.getSessionIdForTemplate(templateId));
    }

    @GetMapping("/{sessionId}/steps")
    public WipStepListRes getSteps(@PathVariable String sessionId) {
        return sessionSvc.getSteps(sessionId);
    }

    @GetMapping("/{sessionId}/step/{stepId}")
    public WipStepDetailRes getStep(@PathVariable String sessionId, @PathVariable String stepId) {
        return sessionSvc.getStep(sessionId, stepId);
    }

    @PostMapping("/{sessionId}/step")
    public WipStepCreateData createStep(@PathVariable String sessionId) {
        return sessionSvc.createStep(sessionId);
    }

    @PutMapping("/{sessionId}/step/{stepId}")
    public void updateStep(@PathVariable String sessionId, @PathVariable String stepId, @RequestBody WipStepUpdateReq req) {
        sessionSvc.updateStep(sessionId, stepId, req);
    }

    @PutMapping("/{sessionId}/step/{stepId}/location")
    public void updateStepLocation(@PathVariable String sessionId, @PathVariable String stepId, @RequestBody @Valid WipStepUpdatePositionReq req) {
        sessionSvc.updateStepLocation(sessionId, stepId, req);
    }

    @DeleteMapping("/{sessionId}/step/{stepId}")
    public void deleteStep(@PathVariable String sessionId, @PathVariable String stepId) {
        sessionSvc.deleteStep(sessionId, stepId);
    }

    @PostMapping("/{sessionId}/steps/connection")
    public StringDto createConnection(@PathVariable String sessionId, @RequestBody @Valid WipStepConnectionData req) {
        return StringDto.of(sessionSvc.createConnection(sessionId, req));
    }

    @DeleteMapping("/{sessionId}/steps/connection/{connectionId}")
    public void deleteConnection(@PathVariable String sessionId, @PathVariable String connectionId) {
        sessionSvc.deleteConnection(sessionId, connectionId);
    }

    @PostMapping("/{sessionId}/complete")
    public void completeTemplate(@PathVariable String sessionId) {

    }
}
