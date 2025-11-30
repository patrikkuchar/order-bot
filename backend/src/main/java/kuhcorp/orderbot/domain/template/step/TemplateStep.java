package kuhcorp.orderbot.domain.template.step;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.db.EntityWithMetadata;
import kuhcorp.orderbot.domain.template.Template;
import kuhcorp.orderbot.domain.template.TemplateInstance;
import kuhcorp.orderbot.domain.template.step.TemplateStepDtos.TemplateStepDto;
import lombok.Getter;

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
    private Integer stepNumber;

    @Getter
    @NotNull
    private String question;

    //temp
    @Getter
    @NotNull
    private Integer nextStepNumber;

    //@NotNull
    //@Embedded
    //private OrderTemplateStepEmbeddedData data;

    //@NotNull
    //private Boolean isFirstStep;

    public static TemplateStep create(TemplateStepDto req, TemplateInstance template, String id) {
        var step = new TemplateStep();
        step.id = id;
        step.template = template;
        step.stepNumber = req.getStepNumber();
        step.question = req.getQuestion();
        step.nextStepNumber = req.getNextStepNumber();
        return step;
    }
}
