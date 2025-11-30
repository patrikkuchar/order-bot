package kuhcorp.orderbot.domain.template.wip.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepType;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepListConnectionNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.util.List;

import static jakarta.persistence.EnumType.STRING;
import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.TEXT_OUTPUT_NODE;
import static org.hibernate.type.SqlTypes.JSON;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class WipStepData {

    @NotNull
    @Enumerated(STRING)
    private TemplateStepType type;

    @JdbcTypeCode(JSON)
    @Column(columnDefinition = "json")
    private WipStepTypeSelect selectTypeData;

    @JsonIgnore
    public List<WipStepListConnectionNode> getOutputNodes() {
        return switch (type) {
            case TEXT -> List.of(TEXT_OUTPUT_NODE);
            case SELECT -> selectTypeData.getOptions().stream()
                    .map(option -> WipStepListConnectionNode.of(
                            option.getValue(),
                            option.getLabel()
                    ))
                    .toList();
        };
    }

    public static final WipStepData DEFAULT = new WipStepData(
            TemplateStepType.TEXT,
            null
    );

    @JsonIgnore
    @AssertTrue
    public boolean isValid() {
        if (type == null) {
            return false;
        }
        switch (type) {
            case TEXT:
                return selectTypeData == null;
            case SELECT:
                return selectTypeData != null;
            default:
                return false;
        }
    }
}
