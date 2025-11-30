package kuhcorp.orderbot.domain.template.wip.step;

import kuhcorp.orderbot.db.Repo;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.WipStepListRes;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionData;

import java.util.List;

import static kuhcorp.orderbot.domain.template.wip.step.QWipStep.wipStep;
import static kuhcorp.orderbot.domain.template.wip.step.connection.QWipStepConnection.wipStepConnection;

public interface WipStepRepo extends Repo<WipStep, WipStepId> {

    default WipStepListRes getStepListWithConnections(String sessionId) {
        var steps = getAll(wipStep.session.id.eq(sessionId));

        var stepDtos = steps.stream().map(WipStep::toListDetail).toList();

        var connections = query()
                .select(wipStepConnection)
                .from(wipStepConnection)
                .where(wipStepConnection.source.session.id.eq(sessionId)
                        .or(wipStepConnection.target.session.id.eq(sessionId)))
                .fetch();

        var connectionDtos = connections.stream()
                .map(conn -> WipStepConnectionData.builder()
                        .id(conn.getId())
                        .sourceStepNumber(conn.getSource().getStepNumber())
                        .targetStepNumber(conn.getTarget().getStepNumber())
                        .sourceOutput(conn.getSourceOutputKey())
                        .targetInput(conn.getTargetInputKey())
                        .build());

        return WipStepListRes.builder()
                .steps(stepDtos)
                .connections(connectionDtos.toList())
                .build();
    }

    default List<String> getStepNumbersForSession(String sessionId) {
        return query()
                .select(wipStep.stepNumber)
                .from(wipStep)
                .where(wipStep.session.id.eq(sessionId))
                .fetch();
    }
}
