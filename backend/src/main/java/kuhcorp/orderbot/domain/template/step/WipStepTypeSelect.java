package kuhcorp.orderbot.domain.template.step;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WipStepTypeSelect {

    @NotNull
    @NonNull
    private List<WipStepTypeSelectOption> options;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WipStepTypeSelectOption {
        private String label;
        private String value;
        private String nextStepId;
    }
}
