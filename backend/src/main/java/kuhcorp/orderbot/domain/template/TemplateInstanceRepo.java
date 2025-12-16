package kuhcorp.orderbot.domain.template;

import kuhcorp.orderbot.db.Repo;

import static kuhcorp.orderbot.domain.template.QTemplateInstance.templateInstance;

public interface TemplateInstanceRepo extends Repo<TemplateInstance, String> {

    default TemplateInstance activeInstanceIdForTemplate(String templateId) {
        return fetchActive(templateInstance.parent.id.eq(templateId));
    }
}
