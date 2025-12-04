package kuhcorp.orderbot.domain.template.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hypersistence.utils.hibernate.type.json.JsonType;
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
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import static jakarta.persistence.EnumType.STRING;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStepData {

    @NotNull
    @Enumerated(STRING)
    private TemplateStepType type;

    @Type(JsonType.class)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private TemplateStepTypeSelect selectTypeData;

    @Type(JsonType.class)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
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
