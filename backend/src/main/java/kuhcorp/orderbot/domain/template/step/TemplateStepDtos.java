package kuhcorp.orderbot.domain.template.step;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;
import lombok.Value;

public class TemplateStepDtos {

    @Value
    @Builder
    public static class TemplateStepDto {
        @NotNull
        @NonNull
        Integer stepNumber;

        @NotNull
        @NonNull
        String question;

        @NotNull
        @NonNull
        Integer nextStepNumber;
    }
}
