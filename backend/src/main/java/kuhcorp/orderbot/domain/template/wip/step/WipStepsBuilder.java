package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepData;
import kuhcorp.orderbot.domain.template.step.TemplateStepDesignerData;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeSelect;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeSelect.WipStepTypeSelectOption;
import kuhcorp.orderbot.domain.template.step.types.TemplateStepTypeText;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnection;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepListConnectionNode;
import kuhcorp.orderbot.etc.UuidUtils;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.TEXT_OUTPUT_NODE;

@Component
@RequiredArgsConstructor
public class WipStepsBuilder {

    private final WipStepService stepSvc;

    public List<TemplateStepCreateData> build(String sessionId) {
        var steps = stepSvc.getStepsForSession(sessionId);
        var stepNumberToIdMap = steps.stream()
                .collect(java.util.stream.Collectors.toMap(
                        WipStep::getStepNumber,
                        step -> UuidUtils.gen()
                ));
        return steps.stream()
                .map(s -> {
                    var outgoingConnections = getConnections(s, stepNumberToIdMap);
                    return TemplateStepCreateData.builder()
                            .id(stepNumberToIdMap.get(s.getStepNumber()))
                            .question(s.getQuestion())
                            .isFirstStep(s.getOrderPosition().isFirstStep())
                            .isLastStep(s.getOrderPosition().isLastStep())
                            .data(buildTemplateStepData(s.getData(), outgoingConnections, s.isLastStep()))
                            .designerData(buildDesignerData(s))
                            .build();
                })
                .toList();
    }

    private TemplateStepDesignerData buildDesignerData(WipStep step) {
        var d = new TemplateStepDesignerData();
        d.setStepNumber(step.getStepNumber());
        d.setTitle(step.getTitle());
        d.setPosition(new TemplateStepDesignerData.TemplateStepDesignerPosition(
                step.getGridPosition().getX(),
                step.getGridPosition().getY()
        ));
        return d;
    }

    private TemplateStepData buildTemplateStepData(WipStepData stepData, List<ConnectionInfo> connections, boolean isLastStep) {
        if (isLastStep) {
            return null;
        }

        var d = new TemplateStepData();
        d.setType(stepData.getType());
        switch (stepData.getType()) {
            case TEXT -> d.setTextTypeData(new TemplateStepTypeText(connections.getFirst().targetStepId));
            case SELECT -> {
                d.setSelectTypeData(new TemplateStepTypeSelect(
                        connections.stream().map(conn -> new WipStepTypeSelectOption(
                                conn.nodeInfo.getLabel(),
                                conn.nodeInfo.getKey(),
                                conn.targetStepId
                        )).toList()
                ));
            }
        }
        return d;
    }

    private List<ConnectionInfo> getConnections(WipStep step, Map<String, String> stepNumberToIdMap) {
        if (step.getOutgoingConnections().isEmpty()) {
            return List.of();
        }
        var connectionMap = step.getOutgoingConnections().stream()
                .collect(java.util.stream.Collectors.toMap(
                        WipStepConnection::getSourceOutputKey,
                        conn -> stepNumberToIdMap.get(conn.getTarget().getStepNumber())
                ));

        return switch (step.getData().getType()) {
            case TEXT -> {
                if (connectionMap.size() > 1) {
                    throw new IllegalStateException("Text step cannot have multiple outgoing connections");
                }
                var conn = step.getOutgoingConnections().getFirst();
                yield List.of(ConnectionInfo.of(
                        connectionMap.get(conn.getSourceOutputKey()),
                        TEXT_OUTPUT_NODE
                ));
            }
            case SELECT -> step.getData().getSelectTypeData().getOptions().stream()
                    .map(option -> {
                        var targetStepId = connectionMap.get(option.getValue());
                        return ConnectionInfo.of(
                                targetStepId,
                                WipStepListConnectionNode.of(option.getValue(), option.getLabel())
                        );
                    }).toList();
        };
    }

    @Value(staticConstructor = "of")
    private static class ConnectionInfo {
        @NotNull
        String targetStepId;
        WipStepListConnectionNode nodeInfo;
    }
}
