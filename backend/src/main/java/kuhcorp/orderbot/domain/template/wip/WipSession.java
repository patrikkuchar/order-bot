package kuhcorp.orderbot.domain.template.wip;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.db.EntityWithStatus;
import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.user.User;
import lombok.Getter;

import java.util.List;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.LAZY;
import static kuhcorp.orderbot.domain.template.wip.WipSession.WipStatus.*;

@Entity
public class WipSession extends EntityWithMetadataAndId implements EntityWithStatus {

    @NotNull
    @ManyToOne(fetch = LAZY)
    private User user;

    @Getter
    @NotNull
    @ManyToOne(fetch = LAZY)
    private TemplateInstance ofTemplateInstance;

    @NotNull
    @Enumerated(STRING)
    private WipStatus status;

    public static WipSession create(User user, TemplateInstance template) {
        var wip = new WipSession();
        wip.user = user;
        wip.ofTemplateInstance = template;
        wip.status = NO_CHANGES;
        return wip;
    }

    public void update(TemplateInstance template) {
        if (this.status != NO_CHANGES) {
            throw new IllegalStateException("Cannot update a WIP session that is not in NO_CHANGES status.");
        }
        this.ofTemplateInstance = template;
    }

    public boolean isCompleted() {
        return COMPLETED.equals(status);
    }

    public boolean isUpdateNeeded(String newestTemplateInstanceId) {
        return NO_CHANGES.equals(status) && !newestTemplateInstanceId.equals(ofTemplateInstance.getId());
    }

    public void start() {
        if (!isActive()) {
            throw new IllegalStateException("Cannot start a WIP session that is not in NO_CHANGES status.");
        }
        this.status = IN_PROGRESS;
    }

    public void complete() {
        if (this.status != IN_PROGRESS) {
            throw new IllegalStateException("Cannot complete a WIP session that is not in progress.");
        }
        this.status = COMPLETED;
    }

    public void abandon() {
        if (this.status != IN_PROGRESS) {
            throw new IllegalStateException("Cannot abandon a WIP session that is not in progress.");
        }
        this.status = ABANDONED;
    }

    public boolean isOwner(String userId) {
        return this.user.getId().equals(userId);
    }

    @Override
    public boolean isActive() {
        return List.of(NO_CHANGES, IN_PROGRESS).contains(status);
    }

    public enum WipStatus {
        NO_CHANGES,
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }
}


