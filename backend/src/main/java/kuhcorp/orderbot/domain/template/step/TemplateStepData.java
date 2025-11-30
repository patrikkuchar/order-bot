package kuhcorp.orderbot.domain.template.step;

import jakarta.persistence.Embeddable;

@Embeddable
public class TemplateStepData {

    String stepNumber;

    String question;
}
