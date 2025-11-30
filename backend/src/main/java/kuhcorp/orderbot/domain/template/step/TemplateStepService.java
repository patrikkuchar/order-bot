package kuhcorp.orderbot.domain.template.step;

import kuhcorp.orderbot.domain.template.Template;
import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepDto;
import kuhcorp.orderbot.etc.UuidUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TemplateStepService {

    private final TemplateStepRepo repo;

    public void create(List<TemplateStepDto> steps, TemplateInstance template) {
        var toSave = steps.stream()
                .map(s -> {
                    var id = UuidUtils.gen();
                    return TemplateStep.create(s, template, id);
                }).toList();
        repo.saveAll(toSave);
    }

    public List<TemplateStepDto> getForTemplate(Template template) {
        return repo.findAllByTemplate(template).stream()
                .map(step -> TemplateStepDto.builder()
                        .stepNumber(step.getStepNumber())
                        .question(step.getQuestion())
                        .nextStepNumber(step.getNextStepNumber())
                        .build())
                .toList();
    }
}
