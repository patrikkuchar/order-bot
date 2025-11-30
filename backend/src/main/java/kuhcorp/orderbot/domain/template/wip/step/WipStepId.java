package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.NonNull;
import lombok.Value;

import java.io.Serializable;

@Value(staticConstructor = "of")
@EqualsAndHashCode
public class WipStepId implements Serializable {

    @NotNull
    @NonNull
    String session;

    @NotNull
    @NonNull
    String stepNumber;
}
