package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kuhcorp.orderbot.domain.template.step.TemplateStepPosition;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionData;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepListConnectionNode;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

public class WipStepDtos {

    @Builder
    @Data
    public static class WipStepListRes {

        @NotNull
        @Size(min = 1)
        private List<@Valid WipStepListStep> steps;

        @NotNull
        private List<@Valid WipStepConnectionData> connections;
    }

    @Builder
    @Data
    public static class WipStepListStep {

        @NotNull
        private String stepNumber;

        @NotNull
        private TemplateStepPosition orderPosition;

        @NotNull
        @Valid
        private WipStepPosition nodePosition;

        @NotNull
        @Valid
        private WipStepNodeData nodeData;
    }

    @Builder
    @Data
    public static class WipStepNodeData {

        @NotNull
        private String title;

        @NotNull
        private List<@Valid WipStepListConnectionNode> inputs;

        @NotNull
        private List<@Valid WipStepListConnectionNode> outputs;
    }

    @EqualsAndHashCode(callSuper = true)
    @SuperBuilder
    @Data
    public static class WipStepCreateData extends WipStepDetailRes {

        @NotNull
        @Valid
        private WipStepPosition gridPosition;

        @NotNull
        @Valid
        private WipStepNodeData nodeData;
    }

    @SuperBuilder
    @Data
    public static class WipStepDetailRes {

        @NotNull
        private String stepNumber;

        @NotNull
        private String title;

        private String question;

        @NotNull
        private TemplateStepPosition orderPosition;

        @NotNull
        @Valid
        private WipStepData data;

        @NotNull
        private List<String> incomingConnections;

        @NotNull
        private List<String> outgoingConnections;
    }

    @Data
    @NoArgsConstructor
    public static class WipStepUpdateReq {

        @NotNull
        private String title;

        @Size(max = 5000)
        private String question;

        @NotNull
        private TemplateStepPosition orderPosition;

        @NotNull
        @Valid
        private WipStepData data;
    }

    @Data
    @NoArgsConstructor
    public static class WipStepUpdatePositionReq {
        @NotNull
        @Valid
        private WipStepPosition position;
    }
}
