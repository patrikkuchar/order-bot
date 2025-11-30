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

    public static WipStepPosition of(Double x, Double y) {
        return new WipStepPosition(x, y);
    }
}
