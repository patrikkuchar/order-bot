package kuhcorp.orderbot.domain.template.step;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadata;
import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepCreateData;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

@Entity
public class TemplateStep extends EntityWithMetadata {

    @Id
    @Getter
    private String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    private TemplateInstance template;

    @Getter
    @NotNull
    @Column(length = 5000)
    private String question;

    @NotNull
    private Boolean isFirstStep;

    @NotNull
    private Boolean isLastStep;

    @Getter
    @Embedded
    @Valid
    private TemplateStepData data;

    @NotNull
    @Valid
    @Type(JsonType.class)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private TemplateStepDesignerData designerData;

    public static TemplateStep create(TemplateStepCreateData req, TemplateInstance template) {
        var step = new TemplateStep();
        step.id = req.getId();
        step.template = template;
        step.question = req.getQuestion();
        step.isFirstStep = req.getIsFirstStep();
        step.isLastStep = req.getIsLastStep();
        step.data = req.getData();
        step.designerData = req.getDesignerData();
        return step;
    }

    public TemplateStepCreateData toData() {
        return TemplateStepCreateData.builder()
                .id(id)
                .question(question)
                .isFirstStep(isFirstStep)
                .isLastStep(isLastStep)
                .data(data)
                .designerData(designerData)
                .build();
    }
}
