package kuhcorp.orderbot.domain.template.wip.step;

import java.util.List;
import java.util.Optional;

public interface WipStepTypeValidators {

    Optional<String> missingField();

    boolean requiredLength();

    Optional<String> notFilledConnectionNodes(List<String> connectedKeys);

    static WipStepTypeValidators anonymous() {
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
                return Optional.empty();
            }
        };
    }
}
