package kuhcorp.orderbot.domain.template.step;

import kuhcorp.orderbot.db.Repo;
import kuhcorp.orderbot.domain.template.Template;

import java.util.List;

public interface TemplateStepRepo extends Repo<TemplateStep, String> {

    List<TemplateStep> findAllByTemplate(Template template);
}
