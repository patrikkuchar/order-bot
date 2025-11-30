package kuhcorp.orderbot.domain.template.wip.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeSelect;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;
import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WipStepTypeSelect implements WipStepTypeValidators {

    @NotNull
    @NonNull
    private List<WipStepTypeSelectOption> options;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WipStepTypeSelectOption {
        private String label;
        private String value;
    }

    @JsonIgnore
    public static WipStepTypeSelect of(TemplateStepTypeSelect data) {
        var options = data.getOptions().stream()
                .map(option -> new WipStepTypeSelectOption(option.getLabel(), option.getValue()))
                .toList();
        return new WipStepTypeSelect(options);
    }

    @Override
    @JsonIgnore
    public Optional<String> missingField() {
        var index = 1;
        for (var option : options) {
            if (!isValid(option.getLabel())) {
                return Optional.of(String.format("Select option %d is missing label field", index));
            }
            if (!isValid(option.getValue())) {
                return Optional.of(String.format("Select option %d is missing value field", index));
            }
            index++;
        }
        return Optional.empty();
    }

    @Override
    @JsonIgnore
    public boolean requiredLength() {
        return !options.isEmpty();
    }

    @Override
    @JsonIgnore
    public Optional<String> notFilledConnectionNodes(List<String> connectedKeys) {
        for (var option : options) {
            if (!connectedKeys.contains(option.getValue())) {
                return Optional.of(String.format("Select option with value '%s' is not connected to any step", option.getValue()));
            }
        }

        if (connectedKeys.size() > options.size()) {
            return Optional.of("There are connected steps that do not correspond to any select option");
        }

        return Optional.empty();
    }

    @JsonIgnore
    private boolean isValid(String fieldName) {
        return fieldName != null && !fieldName.isEmpty();
    }
}
