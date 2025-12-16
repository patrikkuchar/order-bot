package kuhcorp.orderbot.domain.template.step.types;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStepTypeSelect {

    @NotNull
    @NonNull
    private List<WipStepTypeSelectOption> options;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WipStepTypeSelectOption {
        @NotNull
        private String label;
        @NotNull
        private String value;
        @NotNull
        private String nextStepId;
    }
}
