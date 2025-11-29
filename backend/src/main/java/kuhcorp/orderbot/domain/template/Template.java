package kuhcorp.orderbot.domain.template;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.db.EntityWithStatus;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateCreateReq;
import lombok.Getter;

//Note: Immutable, every update in steps should create a new record; TODO needs create this functionality (extract same data - butUsername, ownerChatId, name, etc.)
@Entity
public class Template extends EntityWithMetadataAndId implements EntityWithStatus {

    @NotNull
    @Getter
    private String name;

    //@NotNull
    //@Getter
    //private String botUsername;

    @Getter
    private String description;

    //@NotNull
    //@Getter
    //private String customerFinalMessage;

    //@NotNull
    //@Getter
    //private String ownerSummaryMessage;

    //@Getter
    //private String ownerChatId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private OrderTemplateStatus status;

    public static Template create(TemplateCreateReq req) {
        var t = new Template();
        t.name = req.getName();
        t.description = req.getDescription().orElse(null);

        t.status = OrderTemplateStatus.ACTIVE; //TODO change to NEEDS_ACTIVATION
        return t;
    }

    public enum OrderTemplateStatus {
        NEEDS_ACTIVATION,
        ACTIVE,
        ARCHIVED,
        DEACTIVATED
    }

    @Override
    public boolean isActive() {
        return OrderTemplateStatus.ACTIVE.equals(status);
    }
}
