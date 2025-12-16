package kuhcorp.orderbot.domain.template;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.db.EntityWithStatus;
import kuhcorp.orderbot.domain.template.TemplateManagerDtos.TemplateCreateReq;
import lombok.Getter;

import static kuhcorp.orderbot.domain.template.Template.OrderTemplateStatus.ACTIVE;
import static kuhcorp.orderbot.domain.template.Template.OrderTemplateStatus.NOT_DESIGNED;

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

    @NotNull
    private Boolean connected;

    public static Template create(TemplateCreateReq req) {
        var t = new Template();
        t.name = req.getName();
        t.description = req.getDescription().orElse(null);
        t.connected = false;

        t.status = NOT_DESIGNED;
        return t;
    }

    public void activateIfNotDesignedStatus() {
        if (NOT_DESIGNED.equals(status))
            status = ACTIVE;
    }

    public enum OrderTemplateStatus {
        NOT_DESIGNED,
        ACTIVE,
        ARCHIVED,
        DEACTIVATED
    }

    @Override
    public boolean isActive() {
        return ACTIVE.equals(status) && connected;
    }
}
