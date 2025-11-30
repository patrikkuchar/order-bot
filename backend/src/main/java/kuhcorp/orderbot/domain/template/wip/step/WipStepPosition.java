package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WipStepPosition {

    @NotNull
    @NonNull
    private Double x;

    @NotNull
    @NonNull
    private Double y;
}
