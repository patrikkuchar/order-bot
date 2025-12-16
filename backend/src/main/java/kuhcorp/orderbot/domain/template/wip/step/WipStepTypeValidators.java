package kuhcorp.orderbot.domain.template.wip.step;

import java.util.List;
import java.util.Optional;

public interface WipStepTypeValidators {

    Optional<String> missingField();

    boolean requiredLength();

    Optional<String> notFilledConnectionNodes(List<String> connectedKeys);

    int getNumberOfOutputNodes();

    boolean containsOutputNode(String key);
}
