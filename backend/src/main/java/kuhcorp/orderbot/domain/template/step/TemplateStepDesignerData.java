package kuhcorp.orderbot.domain.template.step;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStepDesignerData {

    @NotNull
    private String stepNumber;

    @NotNull
    private String title;

    @NotNull
    @Valid
    private TemplateStepDesignerPosition position;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateStepDesignerPosition {

        @NotNull
        private Double x;

        @NotNull
        private Double y;
    }
}
