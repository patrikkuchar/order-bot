package kuhcorp.orderbot.domain.template.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeSelect;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeText;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import static jakarta.persistence.EnumType.STRING;
import static org.hibernate.type.SqlTypes.JSON;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStepData {

    @NotNull
    @Enumerated(STRING)
    private TemplateStepType type;

    @JdbcTypeCode(JSON)
    @Column(columnDefinition = "json")
    private TemplateStepTypeSelect selectTypeData;

    @JdbcTypeCode(JSON)
    @Column(columnDefinition = "json")
    private TemplateStepTypeText textTypeData;

    @JsonIgnore
    @AssertTrue
    public boolean isValid() {
        if (type == null) {
            return false;
        }
        switch (type) {
            case TEXT:
                return selectTypeData == null && textTypeData != null;
            case SELECT:
                return selectTypeData != null && textTypeData == null;
            default:
                return false;
        }
    }
}
