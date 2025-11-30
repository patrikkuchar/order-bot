package kuhcorp.orderbot.domain.template;

import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateCreateReq;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateDetail;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateListRes;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import kuhcorp.orderbot.domain.template.step.TemplateStepService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TemplateManagerService {

    private final TemplateRepo repo;
    private final TemplateInstanceRepo instanceRepo;
    private final TemplateStepService stepSvc;

    @Transactional
    public void createTemplate(TemplateCreateReq req) {
        var template = Template.create(req);
        repo.saveAndFlush(template);

        createAndFlushInstance(template);
    }

    public void save(List<TemplateStepCreateData> req, String instanceId) {
        var instance = instanceRepo.getExistingById(instanceId);
        var template = instance.getParent();

        var newInstance = createAndFlushInstance(template);

        stepSvc.create(req, newInstance);

        instance.deprecate();
        template.activateIfNotDesignedStatus();
    }

    public List<TemplateStepCreateData> getForDuplication(String templateId) {
        var instance = instanceRepo.activeInstanceIdForTemplate(templateId);
        return stepSvc.getForDuplication(instance);
    }

    @Transactional
    public List<TemplateListRes> listTemplates() {
        return repo.all();
    }

    @Transactional
    public TemplateDetail getTemplateById(String id) {
        var template = repo.getExistingById(id);
        return TemplateDetail.builder()
                .name(template.getName())
                .description(template.getDescription())
                .build();
    }

    private TemplateInstance createAndFlushInstance(Template template) {
        var instance = TemplateInstance.create(template);
        return instanceRepo.saveAndFlush(instance);
    }

    public TemplateInstance getInstanceByTemplateId(String templateId) {
        return instanceRepo.activeInstanceIdForTemplate(templateId);
    }
}
