package kuhcorp.orderbot.domain.template.wip.step;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadata;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import kuhcorp.orderbot.domain.template.step.TemplateStepPosition;
import kuhcorp.orderbot.domain.template.wip.WipSession;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.WipStepCreateData;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.WipStepListStep;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.WipStepUpdatePositionReq;
import kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.WipStepUpdateReq;
import kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnection;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.EnumType.STRING;
import static jakarta.persistence.FetchType.*;
import static kuhcorp.orderbot.domain.template.wip.step.WipStepDtos.*;
import static kuhcorp.orderbot.domain.template.wip.step.connection.WipStepConnectionConsts.INPUT_NODE;

@Entity
@IdClass(WipStepId.class)
public class WipStep extends EntityWithMetadata {

    @Getter
    @Id
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "session_id")
    private WipSession session;

    @Getter
    @Id
    @Column(name = "step_number")
    @NotNull
    private String stepNumber;

    @Getter
    @OneToMany(mappedBy = "target", cascade = CascadeType.ALL, orphanRemoval = true, fetch = LAZY)
    private List<WipStepConnection> incomingConnections = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "source", cascade = CascadeType.ALL, orphanRemoval = true, fetch = LAZY)
    private List<WipStepConnection> outgoingConnections = new ArrayList<>();

    @Getter
    @NotNull
    private String title;

    @Getter
    @Column(length = 5000)
    private String question;

    @Getter
    @NotNull
    @Embedded
    private WipStepPosition gridPosition;

    @Getter
    @NotNull
    @Enumerated(value = STRING)
    private TemplateStepPosition orderPosition;

    @Getter
    @Embedded
    private WipStepData data;

    public static WipStep create(WipStepCreateData data, WipSession session) {
        var s = new WipStep();
        s.session = session;
        s.stepNumber = data.getStepNumber();
        s.title = data.getTitle();
        s.question = data.getQuestion();
        s.orderPosition = data.getOrderPosition();
        s.data = data.getData();
        s.gridPosition = data.getGridPosition();
        return s;
    }

    public static WipStep create(TemplateStepCreateData data, WipSession session) {
        var s = new WipStep();
        s.session = session;
        s.stepNumber = data.getDesignerData().getStepNumber();
        s.title = data.getDesignerData().getTitle();
        s.question = data.getQuestion();
        s.orderPosition = TemplateStepPosition.of(data.getIsFirstStep(), data.getIsLastStep());
        s.data = data.getIsLastStep() ? WipStepData.DEFAULT : WipStepData.of(data.getData());
        s.gridPosition = WipStepPosition.of(
                data.getDesignerData().getPosition().getX(),
                data.getDesignerData().getPosition().getY()
        );
        return s;
    }

    public boolean isLastStep() {
        return TemplateStepPosition.LAST.equals(orderPosition);
    }

    public boolean isFirstStep() {
        return TemplateStepPosition.FIRST.equals(orderPosition);
    }

    public void update(WipStepUpdateReq req) {
        this.title = req.getTitle();
        this.question = req.getQuestion();
        this.orderPosition = req.getOrderPosition();
        this.data = req.getData();
    }

    public void updatePosition(WipStepUpdatePositionReq newPosition) {
        this.gridPosition = newPosition.getPosition();
    }

    public WipStepListStep toListDetail() {
        return WipStepListStep.builder()
                .stepNumber(stepNumber)
                .orderPosition(orderPosition)
                .nodePosition(gridPosition)
                .nodeData(WipStepNodeData.builder()
                        .title(title)
                        .inputs(isFirstStep() ? List.of() : List.of(INPUT_NODE))
                        .outputs(isLastStep() ? List.of() : data.getOutputNodes())
                        .build())
                .build();
    }

    @AssertTrue
    public boolean hasDataIfNotLast() {
        return isLastStep() || data != null;
    }
}
