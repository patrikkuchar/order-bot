package kuhcorp.template.db.querydsl.filter;

import com.querydsl.core.support.ExtendedSubQuery;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.EnumPath;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.StringPath;

import java.math.BigDecimal;
import java.util.Collection;

public abstract class ListFilter<Fields> {

    private final QueryFilterBuilder builder = QueryFilterBuilder.create();

    protected abstract void apply(Fields fs);

    public ListFilter<Fields> eq(Long v, NumberPath<Long> attr) {
        builder.and(v, attr::eq);
        return this;
    }

    public ListFilter<Fields> contains(String v, StringPath attr) {
        builder.and(v, attr::containsIgnoreCase);
        return this;
    }

    public <E extends Enum<E>> ListFilter<Fields> eq(E v, EnumPath<E> attr) {
        builder.and(v, attr::eq);
        return this;
    }

    public <E extends Enum<E>> ListFilter<Fields> in(Collection<E> v, EnumPath<E> attr) {
        builder.and(v, attr::in);
        return this;
    }

    public ListFilter<Fields> in(Collection<String> v, StringPath attr) {
        builder.and(v, attr::in);
        return this;
    }

    public ListFilter<Fields> in(Collection<Long> v, NumberPath<Long> attr) {
        builder.and(v, attr::in);
        return this;
    }

    public ListFilter<Fields> between(NumericRange v, ExtendedSubQuery<Long> attr) {
        if (v == null)
            return this;

        builder.and(v.getFrom(), attr::goe);
        builder.and(v.getTo(), attr::loe);

        return this;
    }

    public ListFilter<Fields> between(NumericRange v, NumberPath<Long> attr) {
        if (v == null)
            return this;

        builder.and(v.getFrom(), attr::goe);
        builder.and(v.getTo(), attr::loe);

        return this;
    }

    public ListFilter<Fields> between(DecimalRange v, NumberPath<BigDecimal> attr) {
        if (v == null)
            return this;

        builder.and(v.getFrom(), attr::goe);
        builder.and(v.getTo(), attr::loe);

        return this;
    }

    public Predicate toPredicate(Fields fs) {
        apply(fs);
        return builder.toPredicate();
    }
}
