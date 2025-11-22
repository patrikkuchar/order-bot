package kuhcorp.orderbot.etc.time;

import java.time.Clock;
import java.time.Instant;
import java.util.Date;

public interface AppClock {

    Instant now();

    Date nowDate();

    Date toDate(Instant instant);

    static AppClock simpleImpl(Clock clock) {
        return new AppClock() {
            @Override
            public Instant now() {
                return Instant.now(clock);
            }

            @Override
            public Date nowDate() {
                return toDate(clock.instant());
            }

            @Override
            public Date toDate(Instant instant) {
                return Date.from(instant);
            }
        };
    }
}
