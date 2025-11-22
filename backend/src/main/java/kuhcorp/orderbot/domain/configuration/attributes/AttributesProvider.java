package kuhcorp.orderbot.domain.configuration.attributes;

import com.querydsl.jpa.impl.JPAQuery;
import jakarta.persistence.EntityManager;
import kuhcorp.orderbot.domain.configuration.attributes.Attributes.AttributeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

import static kuhcorp.orderbot.domain.configuration.attributes.QAttributes.attributes;

@Component
@RequiredArgsConstructor
public class AttributesProvider {

    private final EntityManager em;

    public Optional<String> get(AttributeType type) {
        return Optional.ofNullable(
                query()
                    .select(attributes.value)
                    .from(attributes)
                    .where(attributes.type.eq(type))
                    .fetchOne()
        );
    }

    public void set(AttributeType type, String value) {
        var attr = Optional.ofNullable(
                query()
                    .select(attributes)
                    .from(attributes)
                    .where(attributes.type.eq(type))
                    .fetchOne()
        );
        if (attr.isEmpty()) {
            var newAttr = Attributes.create(type, value);
            em.persist(newAttr);
            return;
        }

        attr.get().update(value);
    }

    public JPAQuery<?> query() {
        return new JPAQuery<>(em);
    }
}
