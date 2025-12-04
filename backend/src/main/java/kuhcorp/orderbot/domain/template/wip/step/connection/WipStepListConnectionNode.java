package kuhcorp.orderbot.domain.template.wip.step.connection;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value(staticConstructor = "of")
public class WipStepListConnectionNode {
    @NotNull
    String key;

    @NotNull
    String label;
}
