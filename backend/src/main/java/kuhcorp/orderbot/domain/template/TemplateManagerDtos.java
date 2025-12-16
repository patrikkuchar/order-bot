package kuhcorp.orderbot.domain.template;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Optional;

public class TemplateManagerDtos {

    @Data
    @NoArgsConstructor
    public static class TemplateCreateReq {

        @NotNull
        private String name;

        private Optional<String> description = Optional.empty();
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
    }
}
