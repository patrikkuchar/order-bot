package kuhcorp.orderbot.db.querydsl.filter;

import jakarta.validation.constraints.AssertTrue;

public abstract class Range<V extends Comparable<V>> {

    abstract V getFrom();

    abstract V getTo();


    @AssertTrue
    boolean isFromGteTo() {
        return getFrom().compareTo(getTo()) >= 0;
    }
}

