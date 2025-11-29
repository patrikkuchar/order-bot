package kuhcorp.orderbot.domain.template;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.Optional;

import static kuhcorp.orderbot.domain.template.step.TemplateStepDtos.*;

public class TemplateManagerDtos {

    @Data
    @NoArgsConstructor
    public static class TemplateCreateReq {

        @NotNull
        private String name;

        private Optional<String> description = Optional.empty();

        @NotNull
        @Valid
        private List<TemplateStepDto> steps;
    }

    @Value(staticConstructor = "of")
    public static class TemplateListRes {
        @NotNull
        String id;

        @NotNull
        String name;
    }

    @Builder
    @Getter
    public static class TemplateDetail {

        @NotNull
        @NonNull
        private String name;

        private String description;

        @NotNull
        @NonNull
        private List<TemplateStepDto> steps;
    }
}
