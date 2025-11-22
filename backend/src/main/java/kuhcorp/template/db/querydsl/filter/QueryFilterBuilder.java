package kuhcorp.template.db.querydsl.filter;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class QueryFilterBuilder {

    private final BooleanBuilder builder = new BooleanBuilder();

    public <V> QueryFilterBuilder and(V v, PropPredicateProvider<V> pb) {
        if (v != null) {
            builder.and(pb.provide(v));
        }

        return this;
    }

    public static QueryFilterBuilder create() {
        return new QueryFilterBuilder();
    }

    public Predicate toPredicate() {
        return builder;
    }


    public interface PropPredicateProvider<V> {

        Predicate provide(V v);
    }

}

