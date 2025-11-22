package kuhcorp.dataseeding;

import kuhcorp.template.auth.CurrentUserHolder;
import kuhcorp.template.auth.userHolder.SystemUserHolder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MockedBeansConfig {

    @Bean
    public CurrentUserHolder currentUserHolder() {
        return new SystemUserHolder();
    }
}
