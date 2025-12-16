package kuhcorp.orderbot.domain.template.wip.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepData;
import kuhcorp.orderbot.domain.template.step.TemplateStepType;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepListConnectionNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Optional;

import static jakarta.persistence.EnumType.STRING;
import static kuhcorp.orderbot.domain.template.step.TemplateStepType.TEXT;
import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.INPUT_NODE;
import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.TEXT_OUTPUT_NODE;

@Data
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class WipStepData implements WipStepTypeValidators {

    @NotNull
    @Enumerated(STRING)
    private TemplateStepType type;

    @Type(JsonType.class)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private WipStepTypeSelect selectTypeData;

    @JsonIgnore
    public static WipStepData of(TemplateStepData data) {
        var d = new WipStepData();
        d.setType(data.getType());
        if (TemplateStepType.SELECT.equals(data.getType())) {
            d.selectTypeData = WipStepTypeSelect.of(data.getSelectTypeData());
        }
        return d;
    }

    @JsonIgnore
    public List<WipStepListConnectionNode> getInputNodes() {
        return List.of(INPUT_NODE);
    }

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

    @JsonIgnore
    public static final WipStepData DEFAULT = new WipStepData(
            TEXT,
            null
    );

    @Override
    @JsonIgnore
    public Optional<String> missingField() {
        var validator = getValidator();
        return validator.missingField();
    }

    @Override
    @JsonIgnore
    public boolean requiredLength() {
        var validator = getValidator();
        return validator.requiredLength();
    }

    @Override
    @JsonIgnore
    public Optional<String> notFilledConnectionNodes(List<String> connectedKeys) {
        var validator = getValidator();
        return validator.notFilledConnectionNodes(connectedKeys);
    }

    @Override
    @JsonIgnore
    public int getNumberOfOutputNodes() {
        var validator = getValidator();
        return validator.getNumberOfOutputNodes();
    }

    @JsonIgnore
    public boolean containsInputNode(String key) {
        return INPUT_NODE.getKey().equals(key);
    }

    @Override
    @JsonIgnore
    public boolean containsOutputNode(String key) {
        var validator = getValidator();
        return validator.containsOutputNode(key);
    }

    @JsonIgnore
    private WipStepTypeValidators getValidator() {
        return switch (type) {
            case TEXT -> textValidator();
            case SELECT -> selectTypeData;
        };
    }

    @JsonIgnore
    @AssertTrue
    public boolean isValid() {
        if (type == null) {
            return false;
        }
        switch (type) {
            case TEXT:
                return true;
            case SELECT:
                return selectTypeData != null;
            default:
                return false;
        }
    }

    @JsonIgnore
    private static WipStepTypeValidators textValidator() {
        return new WipStepTypeValidators() {
            @Override
            public Optional<String> missingField() {
                return Optional.empty();
            }

            @Override
            public boolean requiredLength() {
                return true;
            }

            @Override
            public Optional<String> notFilledConnectionNodes(List<String> connectedKeys) {
                if (connectedKeys.size() != 1)
                    return Optional.of("TEXT step must have exactly one output connection");
                var key = connectedKeys.get(0);
                if (!TEXT_OUTPUT_NODE.getKey().equals(key))
                    return Optional.of(String.format("TEXT step output connection key must be '%s'", TEXT_OUTPUT_NODE.getKey()));
                return Optional.empty();
            }

            @Override
            public int getNumberOfOutputNodes() {
                return 1;
            }

            @Override
            public boolean containsOutputNode(String key) {
                return TEXT_OUTPUT_NODE.getKey().equals(key);
            }
        };
    }
}
