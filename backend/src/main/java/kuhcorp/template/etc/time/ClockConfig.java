package kuhcorp.template.etc.time;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return clock(ZoneId.of("Europe/Bratislava"));
    }

    private Clock clock(ZoneId zoneId) {
        return Clock.systemDefaultZone().withZone(zoneId);
    }

    @Bean
    public AppClock appClock(Clock clock) {
        return AppClock.simpleImpl(clock);
    }
}
