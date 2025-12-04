package kuhcorp.orderbot.domain.template.wip.step.connection;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class WipStepConnectionCreateReq {

    @NotNull
    private String sourceStepNumber;

    @NotNull
    private String targetStepNumber;

    @NotNull
    private String sourceOutput;

    @NotNull
    private String targetInput;
}
