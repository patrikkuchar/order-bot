package kuhcorp.orderbot.domain.template.step;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(enumAsRef = true)
public enum TemplateStepType {
    TEXT,
    SELECT
}
