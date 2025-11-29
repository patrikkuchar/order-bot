package kuhcorp.orderbot.domain.template;

import kuhcorp.orderbot.db.Repo;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateListRes;

import java.util.List;

import static kuhcorp.orderbot.domain.template.QTemplate.template;

public interface TemplateRepo extends Repo<Template, String> {

    default List<TemplateListRes> all() {
        return query()
                .select(template.id, template.name)
                .from(template)
                .fetch()
                .stream()
                .map(rec -> TemplateListRes.of(
                        rec.get(template.id),
                        rec.get(template.name)
                ))
                .toList();
    }
}
