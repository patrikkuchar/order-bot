package kuhcorp.orderbot.domain.template.step;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(enumAsRef = true)
@RequiredArgsConstructor
public enum TemplateStepPosition {
    FIRST(true, false),
    MIDDLE(false, false),
    LAST(false, true);

    @Getter
    private final boolean isFirstStep;
    @Getter
    private final boolean isLastStep;

    public static TemplateStepPosition of(Boolean isFirst, Boolean isLast) {
        if (Boolean.TRUE.equals(isFirst))
            return FIRST;
        if (Boolean.TRUE.equals(isLast))
            return LAST;
        return MIDDLE;
    }
}
