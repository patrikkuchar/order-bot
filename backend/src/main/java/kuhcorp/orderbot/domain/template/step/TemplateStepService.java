package kuhcorp.orderbot.domain.template.step;

import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TemplateStepService {

    private final TemplateStepRepo repo;

    public void create(List<TemplateStepCreateData> req, TemplateInstance template) {
        var steps = req.stream()
                .map(s -> TemplateStep.create(s, template))
                .toList();
        repo.saveAll(steps);
    }

    public List<TemplateStepCreateData> getForDuplication(TemplateInstance template) {
        var steps = repo.getAllByTemplateId(template.getId());
        return steps.stream()
                .map(TemplateStep::toData)
                .toList();
    }
}
