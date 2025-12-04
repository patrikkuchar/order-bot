package kuhcorp.orderbot.domain.template.wip.step.connection;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.domain.template.wip.step.WipStep;
import lombok.Getter;

import static jakarta.persistence.FetchType.LAZY;

@Entity
public class WipStepConnection extends EntityWithMetadataAndId {

    @Getter
    @NotNull
    @ManyToOne(fetch = LAZY)
    private WipStep source;

    @Getter
    @NotNull
    @ManyToOne(fetch = LAZY)
    private WipStep target;

    @Getter
    @NotNull
    private String sourceOutputKey;

    @Getter
    @NotNull
    private String targetInputKey;

    public static WipStepConnection create(WipStep source, WipStep target, String sourceOutputKey, String targetInputKey) {
        var connection = new WipStepConnection();
        connection.source = source;
        connection.target = target;
        connection.sourceOutputKey = sourceOutputKey;
        connection.targetInputKey = targetInputKey;
        return connection;
    }
}
