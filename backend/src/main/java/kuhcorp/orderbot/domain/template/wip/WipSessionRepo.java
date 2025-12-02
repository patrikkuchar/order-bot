package kuhcorp.orderbot.domain.template.wip;

import kuhcorp.orderbot.db.Repo;

import java.util.List;
import java.util.Optional;

import static kuhcorp.orderbot.domain.template.QTemplateInstance.templateInstance;
import static kuhcorp.orderbot.domain.template.wip.QWipSession.wipSession;
import static kuhcorp.orderbot.domain.template.wip.WipSession.WipStatus.ABANDONED;
import static kuhcorp.orderbot.domain.template.wip.WipSession.WipStatus.COMPLETED;

public interface WipSessionRepo extends Repo<WipSession, String> {

    default Optional<WipSession> getSessionForTemplate(String templateId, String userId) {
        return Optional.ofNullable(
                query()
                        .select(wipSession)
                        .from(wipSession)
                        .join(wipSession.ofTemplateInstance, templateInstance)
                        .where(wipSession.user.id.eq(userId)
                                .and(templateInstance.parent.id.eq(templateId))
                                .and(wipSession.status.notIn(List.of(ABANDONED, COMPLETED))))
                        .fetchOne()
        );
    }
}
