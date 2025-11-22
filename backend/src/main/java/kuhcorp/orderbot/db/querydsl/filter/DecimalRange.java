package kuhcorp.orderbot.db.querydsl.filter;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class DecimalRange extends Range<BigDecimal> {

    private BigDecimal from;

    private BigDecimal to;
}

