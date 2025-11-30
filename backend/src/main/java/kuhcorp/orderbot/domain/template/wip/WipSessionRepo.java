package kuhcorp.orderbot.domain.template.wip;

import kuhcorp.orderbot.db.Repo;

import java.util.Optional;

import static kuhcorp.orderbot.domain.template.QTemplateInstance.templateInstance;
import static kuhcorp.orderbot.domain.template.wip.QWipSession.wipSession;

public interface WipSessionRepo extends Repo<WipSession, String> {

    default Optional<WipSession> getSessionForTemplate(String templateId, String userId) {
        return Optional.ofNullable(
                query()
                        .select(wipSession)
                        .from(wipSession)
                        .join(wipSession.ofTemplateInstance)
                        .where(wipSession.user.id.eq(userId)
                                .and(templateInstance.parent.id.eq(templateId)))
                        .fetchOne()
        );
    }
}
