package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.domain.template.step.TemplateStepData;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import kuhcorp.orderbot.domain.template.step.TemplateStepPosition;
import kuhcorp.orderbot.domain.template.wip.WipSession;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.*;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnection;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionData;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionRepo;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.INPUT_NODE;
import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.TEXT_OUTPUT_NODE;

@Component
@RequiredArgsConstructor
public class WipStepService {

    private static final String STEP_NUMBER_PREFIX = "S";
    private static final WipStepPosition DEFAULT_STEP_POSITION = new WipStepPosition(100d, 100d);

    private final WipStepRepo repo;
    private final WipStepConnectionRepo connectionRepo;

    public WipStepListRes getList(String sessionId) {
        return repo.getStepListWithConnections(sessionId);
    }

    public WipStepDetailRes get(WipStepId stepId) {
        var step = repo.getExistingById(stepId);

        return WipStepDetailRes.builder()
                .stepNumber(step.getStepNumber())
                .title(step.getTitle())
                .question(step.getQuestion())
                .orderPosition(step.getOrderPosition())
                .data(step.getData())
                .incomingConnections(getStepNumbers(step.getIncomingConnections()))
                .outgoingConnections(getStepNumbers(step.getOutgoingConnections()))
                .build();
    }

    public WipStepCreateData create(WipSession session) {
        var data = WipStepCreateData.builder()
                .stepNumber(newStepNumberForSession(session.getId()))
                .title("New Step")
                .question(null)
                .orderPosition(TemplateStepPosition.MIDDLE)
                .data(WipStepData.DEFAULT)
                .incomingConnections(List.of())
                .outgoingConnections(List.of())
                .gridPosition(DEFAULT_STEP_POSITION)
                .inputs(List.of(INPUT_NODE))
                .outputs(List.of(TEXT_OUTPUT_NODE))
                .build();

        var step = WipStep.create(data, session);
        repo.saveAndFlush(step);

        return data;
    }

    public void update(WipStepId stepId, WipStepUpdateReq req) {
        var step = repo.getExistingById(stepId);
        step.update(req);
    }

    public void updatePosition(WipStepId stepId, WipStepUpdatePositionReq req) {
        var step = repo.getExistingById(stepId);
        step.updatePosition(req);
    }

    public void delete(WipStepId stepId) {
        repo.deleteById(stepId);
    }

    public String createConnection(String sessionId, WipStepConnectionData req) {
        var sourceStep = repo.getExistingById(WipStepId.of(sessionId, req.getSourceStepNumber()));
        var targetStep = repo.getExistingById(WipStepId.of(sessionId, req.getTargetStepNumber()));

        var conn = WipStepConnection.create(sourceStep, targetStep, req.getSourceOutput(), req.getTargetInput());
        connectionRepo.saveAndFlush(conn);

        return conn.getId();
    }

    public void deleteConnection(String sessionId, String connectionId) {
        var conn = connectionRepo.getExistingById(connectionId);
        if (!sessionId.equals(conn.getSource().getSession().getId())) {
            throw new IllegalStateException("Connection does not belong to the specified session.");
        }
        connectionRepo.delete(conn);
    }

    public List<WipStep> getStepsForSession(String sessionId) {
        return repo.getAllBySessionId(sessionId);
    }

    public void loadForkedData(List<TemplateStepCreateData> data, WipSession session) {
        var stepMap = data.stream()
                .collect(java.util.stream.Collectors.toMap(
                        TemplateStepCreateData::getId,
                        stepData -> WipStep.create(stepData, session)
                ));

        repo.saveAllAndFlush(stepMap.values());

        var connections = new ArrayList<WipStepConnection>();
        for (var stepData : data) {
            var sourceStep = stepMap.get(stepData.getId());
            var connData = getConnectionNodes(stepData.getData());
            if (connData.isEmpty())
                continue;
            for (var connNode : connData) {
                var targetStep = stepMap.get(connNode.getStepId());
                var conn = WipStepConnection.create(sourceStep, targetStep, connNode.nodeKey, INPUT_NODE.getKey());
                connections.add(conn);
            }
        }

        connectionRepo.saveAllAndFlush(connections);
    }

    public void removeAllForSession(WipSession session) {
        var steps = repo.getAllBySessionId(session.getId());
        repo.deleteAll(steps);
    }

    private String newStepNumberForSession(String sessionId) {
        var stepNumbers = repo.getStepNumbersForSession(sessionId).stream()
                .map(num -> Integer.parseInt(num.replace(STEP_NUMBER_PREFIX, "")))
                .toList();

        if (stepNumbers.isEmpty()) {
            return STEP_NUMBER_PREFIX + "1";
        }

        var biggestNumber = stepNumbers.stream()
                .max(Integer::compareTo)
                .orElse(0);

        return STEP_NUMBER_PREFIX + (biggestNumber + 1);
    }

    private List<String> getStepNumbers(List<WipStepConnection> connections) {
        return connections.stream()
                .map(conn -> conn.getSource().getStepNumber())
                .toList();
    }

    private List<ConnectionNode> getConnectionNodes(TemplateStepData stepData) {
        return switch(stepData.getType()) {
            case TEXT -> List.of(ConnectionNode.of(stepData.getTextTypeData().getNextStepId(), TEXT_OUTPUT_NODE.getKey()));
            case SELECT -> stepData.getSelectTypeData().getOptions().stream()
                    .map(option -> ConnectionNode.of(option.getNextStepId(), option.getValue()))
                    .toList();
        };
    }

    @Value(staticConstructor = "of")
    private static class ConnectionNode {
        @NotNull
        String stepId;
        @NotNull
        String nodeKey;
    }
}
