package kuhcorp.orderbot.domain.template;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.db.EntityWithStatus;
import lombok.Getter;

import static kuhcorp.orderbot.domain.template.TemplateInstance.TemplateInstanceStatus.ACTIVE;
import static kuhcorp.orderbot.domain.template.TemplateInstance.TemplateInstanceStatus.DEPRECATED;

@Entity
public class TemplateInstance extends EntityWithMetadataAndId implements EntityWithStatus {

    @Getter
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private Template parent;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TemplateInstanceStatus status;

    public static TemplateInstance create(Template parent) {
        var instance = new TemplateInstance();
        instance.parent = parent;
        instance.status = ACTIVE;
        return instance;
    }

    public void deprecate() {
        this.status = DEPRECATED;
    }

    public enum TemplateInstanceStatus {
        ACTIVE,
        DEPRECATED
    }

    @Override
    public boolean isActive() {
        return ACTIVE.equals(status);
    }
}
