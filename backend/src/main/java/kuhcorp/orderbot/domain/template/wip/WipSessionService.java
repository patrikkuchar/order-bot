package kuhcorp.orderbot.domain.template.wip;

import kuhcorp.orderbot.api.BadRequestApiError;
import kuhcorp.orderbot.auth.userHolder.RequestUserHolder;
import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.template.TemplateManagerService;
import kuhcorp.orderbot.domain.template.wip.step.WipStepsBuilder;
import kuhcorp.orderbot.domain.template.wip.step.WipStepId;
import kuhcorp.orderbot.domain.template.wip.step.WipStepService;
import kuhcorp.orderbot.domain.template.wip.step.WipStepsValidator;
import kuhcorp.orderbot.domain.template.wip.step.WipStepsValidator.WipStepValidationRes;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionCreateReq;
import kuhcorp.orderbot.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.*;

@Component
@RequiredArgsConstructor
public class WipSessionService {

    private final WipSessionRepo repo;
    private final TemplateManagerService managerSvc;
    private final WipStepService stepSvc;
    private final RequestUserHolder userHolder;

    private final WipStepsBuilder builder;
    private final WipStepsValidator validator;

    @Transactional
    public String getSessionIdForTemplate(String templateId) {
        var user = userHolder.getUserOrThrow();

        var instance = managerSvc.getInstanceByTemplateId(templateId);

        var session = repo.getSessionForTemplate(templateId, user.getId())
                .orElseGet(() -> createNewSession(instance, user));

        if (session.isCompleted()) {
            session = createNewSession(instance, user);
        }

        if (session.isUpdateNeeded(instance.getId())) {
            session.update(instance);
            deleteAndForkForSession(session);
        }

        return session.getId();
    }

    @Transactional
    public Boolean isSessionChanged(String sessionId) {
        var session = ensureSessionForUser(sessionId);
        return session.isChanged();
    }

    @Transactional
    public WipStepListRes getSteps(String sessionId) {
        ensureSessionForUser(sessionId);
        return stepSvc.getList(sessionId);
    }

    @Transactional
    public WipStepDetailRes getStep(String sessionId, String stepId) {
        ensureSessionForUser(sessionId);
        return stepSvc.get(WipStepId.of(sessionId, stepId));
    }

    @Transactional
    public WipStepCreateData createStep(String sessionId) {
        var session = ensureSessionForUserAndStart(sessionId);
        return stepSvc.create(session);
    }

    @Transactional
    public WipStepNodeData updateStep(String sessionId, String stepId, WipStepUpdateReq req) {
        ensureSessionForUserAndStart(sessionId);
        return stepSvc.update(WipStepId.of(sessionId, stepId), req);
    }

    @Transactional
    public void updateStepLocation(String sessionId, String stepId, WipStepUpdatePositionReq req) {
        ensureSessionForUserAndStart(sessionId);
        stepSvc.updatePosition(WipStepId.of(sessionId, stepId), req);
    }

    @Transactional
    public void deleteStep(String sessionId, String stepId) {
        ensureSessionForUserAndStart(sessionId);
        stepSvc.delete(WipStepId.of(sessionId, stepId));
    }

    @Transactional
    public String createConnection(String sessionId, WipStepConnectionCreateReq req) {
        ensureSessionForUserAndStart(sessionId);
        return stepSvc.createConnection(sessionId, req);
    }

    @Transactional
    public void deleteConnection(String sessionId, String connectionId) {
        ensureSessionForUserAndStart(sessionId);
        stepSvc.deleteConnection(sessionId, connectionId);
    }

    @Transactional
    public WipStepValidationRes validateSession(String sessionId) {
        ensureSessionForUser(sessionId);
        return validator.validate(sessionId);
    }

    @Transactional
    public void saveWipSession(String sessionId) {
        var session = ensureSessionForUserAndStart(sessionId);
        ensureSessionOfNewestTemplateInstance(session);

        if (!validator.isValid(sessionId)) {
            throw new IllegalStateException("WIP session steps are not valid.");
        }

        var stepData = builder.build(sessionId);
        managerSvc.save(stepData, session.getOfTemplateInstance().getId());

        session.complete();
    }

    @Transactional
    public String clearWipSessionAndGetNew(String sessionId) {
        var session = ensureSessionForUser(sessionId);
        if (!isSessionChanged(sessionId)) {
            //TODO: better exception
            throw new IllegalStateException("WIP session is not changed.");
        }

        var templateInstance = session.getOfTemplateInstance();
        var user = userHolder.getUserOrThrow();

        session.abandon();
        var newSession = createNewSession(templateInstance, user);
        return newSession.getId();
    }

    private void ensureSessionOfNewestTemplateInstance(WipSession session) {
        var templateInstance = session.getOfTemplateInstance();
        var newestTemplateInstance = managerSvc.getInstanceByTemplateId(templateInstance.getParent().getId());
        if (!templateInstance.getId().equals(newestTemplateInstance.getId())) {
            throw new WipSessionIsNotOfNewestTemplateInstance();
        }
    }

    private WipSession ensureSessionForUserAndStart(String sessionId) {
        var session = ensureSessionForUser(sessionId);
        session.start();
        return session;
    }

    private WipSession ensureSessionForUser(String sessionId) {
        var userId = userHolder.getUserId();

        var session = repo.getActiveById(sessionId);
        if (!session.isOwner(userId)) {
            throw new IllegalStateException("User does not own this WIP session.");
        }

        return session;
    }

    private WipSession createNewSession(TemplateInstance instance, User user) {
        var newSession = WipSession.create(user, instance);
        repo.saveAndFlush(newSession);
        forkDataForSession(newSession);
        return newSession;
    }

    private void deleteAndForkForSession(WipSession session) {
        stepSvc.removeAllForSession(session);
        forkDataForSession(session);
    }

    private void forkDataForSession(WipSession session) {
        var templateInstance = session.getOfTemplateInstance();
        var stepsData = managerSvc.getForDuplication(templateInstance.getParent().getId());
        stepSvc.loadForkedData(stepsData, session);
    }

    @BadRequestApiError("WipSession/not-of-newest-template-instance")
    public static class WipSessionIsNotOfNewestTemplateInstance extends IllegalStateException {
        public WipSessionIsNotOfNewestTemplateInstance() {
            super("WIP session is not of the newest template instance.");
        }
    }
}
