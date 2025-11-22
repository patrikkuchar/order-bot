package kuhcorp.template.db.querydsl.filter;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class NumericRange extends Range<Long> {

    private Long from;

    private Long to;
}
