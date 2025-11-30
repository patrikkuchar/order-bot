package kuhcorp.orderbot.domain.template.wip.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepPosition;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnection;
import lombok.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WipStepsValidator {

    private final WipStepService stepSvc;

    public boolean isValid(String sessionId) {
        return validate(sessionId).getValid();
    }

    public WipStepValidationRes validate(String sessionId) {
        var steps = stepSvc.getStepsForSession(sessionId);

        if (steps.isEmpty()) {
            return WipStepValidationRes.of(ErrorType.MISSING_STEPS);
        }

        return validSteps(steps).or(() ->
               onlyOneFirstStep(steps).or(() ->
               atLeastOneLastStep(steps).or(() ->
               allInputAndOutputHaveConnections(steps)))).orElseGet(WipStepValidationRes::valid);
    }

    private Optional<WipStepValidationRes> validSteps(List<WipStep> steps) {
        var errorType = ErrorType.MISSING_REQUIRED_FIELDS;
        for (var s : steps) {
            var stepNumber = s.getStepNumber();
            if (s.getQuestion() == null)
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s is missing question field", stepNumber)));
            if (!s.getData().isValid())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s has invalid data field", stepNumber)));
            var missingField = s.getData().missingField();
            if (missingField.isPresent())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s: %s", stepNumber, missingField.get())));
            if (!s.getData().requiredLength())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s data has not required size", stepNumber)));
        }
        return Optional.empty();
    }

    private Optional<WipStepValidationRes> onlyOneFirstStep(List<WipStep> steps) {
        var firstStepsCount = steps.stream()
                .filter(s -> TemplateStepPosition.FIRST.equals(s.getOrderPosition()))
                .count();

        if (firstStepsCount > 1)
            return Optional.of(WipStepValidationRes.of(ErrorType.ONLY_ONE_FIRST_STEP_REQUIRED, "More than one step marked as FIRST step"));
        if (firstStepsCount == 0)
            return Optional.of(WipStepValidationRes.of(ErrorType.ONLY_ONE_FIRST_STEP_REQUIRED, "No step marked as FIRST step"));
        return Optional.empty();
    }

    private Optional<WipStepValidationRes> atLeastOneLastStep(List<WipStep> steps) {
        var lastStepsCount = steps.stream()
                .filter(s -> TemplateStepPosition.LAST.equals(s.getOrderPosition()))
                .count();

        if (lastStepsCount < 1)
            return Optional.of(WipStepValidationRes.of(ErrorType.AT_LEAST_ONE_LAST_STEP_REQUIRED, "No step marked as LAST step"));
        return Optional.empty();
    }

    private Optional<WipStepValidationRes> allInputAndOutputHaveConnections(List<WipStep> steps) {
        var errorType = ErrorType.INVALID_STEP_CONNECTIONS;
        for (var s : steps) {
            if (TemplateStepPosition.FIRST.equals(s.getOrderPosition()) && !s.getIncomingConnections().isEmpty())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s is FIRST but has incoming connections", s.getStepNumber())));
            if (TemplateStepPosition.LAST.equals(s.getOrderPosition()) && !s.getOutgoingConnections().isEmpty())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s is LAST but has outgoing connections", s.getStepNumber())));

            if (!TemplateStepPosition.FIRST.equals(s.getOrderPosition()) && s.getIncomingConnections().isEmpty())
                return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s is missing incoming connections", s.getStepNumber())));
            if (!TemplateStepPosition.LAST.equals(s.getOrderPosition())) {
                if (s.getOutgoingConnections().isEmpty())
                    return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s is missing outgoing connections", s.getStepNumber())));

                var outputKeys = s.getOutgoingConnections().stream()
                        .map(WipStepConnection::getSourceOutputKey)
                        .distinct()
                        .toList();
                var notFilledConnNodes = s.getData().notFilledConnectionNodes(outputKeys);
                if (notFilledConnNodes.isPresent())
                    return Optional.of(WipStepValidationRes.of(errorType, String.format("Step %s invalid connection: %s", s.getStepNumber(), notFilledConnNodes.get())));
            }
        }
        return Optional.empty();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WipStepValidationRes {

        @NotNull
        private Boolean valid;
        private ErrorType errorType;
        private String errorMessage;

        public static WipStepValidationRes valid() {
            return new WipStepValidationRes(true, null, null);
        }
        public static WipStepValidationRes of(ErrorType errorType) {
            return WipStepValidationRes.of(errorType, null);
        }
        public static WipStepValidationRes of(ErrorType errorType, String errorMessage) {
            return new WipStepValidationRes(false, errorType, errorMessage);
        }

        @JsonIgnore
        @AssertTrue
        public boolean isValid() {
            return (valid && errorType == null && errorMessage == null) ||
                   (!valid && errorType != null);
        }
    }

    public enum ErrorType {
        MISSING_STEPS,
        MISSING_REQUIRED_FIELDS,
        ONLY_ONE_FIRST_STEP_REQUIRED,
        AT_LEAST_ONE_LAST_STEP_REQUIRED,
        INVALID_STEP_CONNECTIONS
    }
}
