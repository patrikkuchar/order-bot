package kuhcorp.orderbot.domain.template.step;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import lombok.Value;

public class TemplateStepDtos {

    @Getter
    @Builder
    public static class TemplateStepCreateData {
        @NotNull
        private String id;

        @NotNull
        @Size(max = 5000)
        private String question;

        @NotNull
        private Boolean isFirstStep;

        @NotNull
        private Boolean isLastStep;

        @NotNull
        @Valid
        private TemplateStepData data;

        @NotNull
        @Valid
        private TemplateStepDesignerData designerData;
    }
}
