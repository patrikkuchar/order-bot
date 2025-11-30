package kuhcorp.orderbot.domain.template.step.types;

import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepType;
import kuhcorp.orderbot.domain.template.wip.step.WipStepTypeSelect;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import static jakarta.persistence.EnumType.STRING;
import static org.hibernate.type.SqlTypes.JSON;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStepTypeText {

    @NotNull
    private String nextStepId;
}
