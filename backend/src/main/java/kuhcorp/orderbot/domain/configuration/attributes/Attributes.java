package kuhcorp.orderbot.domain.configuration.attributes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "config_attributes")
public class Attributes {

    @Id
    @NotNull
    @Enumerated(EnumType.STRING)
    private AttributeType type;

    @NotNull
    private String value;

    public static Attributes create(AttributeType attrType, String value) {
        var a = new Attributes();
        a.type = attrType;
        a.update(value);
        return a;
    }

    public void update(String value) {
        this.value = value;
    }

    public enum AttributeType {
        SEED_VERSION
    }
}
