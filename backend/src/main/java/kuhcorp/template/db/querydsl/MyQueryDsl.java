package kuhcorp.template.db.querydsl;

import com.querydsl.core.types.Expression;
import com.querydsl.jpa.impl.JPAQuery;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MyQueryDsl {

    private final EntityManager em;

    public JPAQuery<?> query() {
        return new JPAQuery<>(em);
    }
}

