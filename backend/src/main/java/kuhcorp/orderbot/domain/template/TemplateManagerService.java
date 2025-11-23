package kuhcorp.orderbot.domain.template;

import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateCreateReq;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateDetail;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateListRes;
import kuhcorp.orderbot.domain.template.step.TemplateStepService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TemplateManagerService {

    private final TemplateRepo repo;
    private final TemplateStepService stepSvc;

    @Transactional
    public void createTemplate(TemplateCreateReq req) {
        var template = Template.create(req);
        repo.saveAndFlush(template);

        stepSvc.create(req.getSteps(), template);
    }

    @Transactional
    public List<TemplateListRes> listTemplates() {
        return repo.all();
    }

    @Transactional
    public TemplateDetail getTemplateById(String id) {
        var template = repo.getExistingById(id);
        var steps = stepSvc.getForTemplate(template);
        return TemplateDetail.builder()
                .name(template.getName())
                .description(template.getDescription())
                .steps(steps)
                .build();
    }
}
