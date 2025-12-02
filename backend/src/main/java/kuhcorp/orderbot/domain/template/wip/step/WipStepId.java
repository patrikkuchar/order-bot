package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class WipStepId implements Serializable {

    @NotNull
    @NonNull
    private String session;

    @NotNull
    @NonNull
    private String stepNumber;

    public static WipStepId of(String session, String stepNumber) {
        return new WipStepId(session, stepNumber);
    }
}
