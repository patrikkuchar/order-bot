package kuhcorp.orderbot.auth;

import kuhcorp.orderbot.auth.provider.custom.JwtTokenCodec;
import kuhcorp.orderbot.auth.provider.custom.CustomUserProvider;
import kuhcorp.orderbot.domain.user.UserService;
import kuhcorp.orderbot.etc.time.AppClock;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static kuhcorp.orderbot.api.ApiRoutes.*;
import static kuhcorp.orderbot.auth.UserRole.RoleConstants.ADMIN_ROLE;
import static kuhcorp.orderbot.auth.UserRole.RoleConstants.USER_ROLE;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class AuthConfig {

    private final AuthConfProps props;
    private final AppClock clock;
    private final RestAuthenticationEntryPoint entryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var authFilter = new AuthTokenFilter(tokenCodec());
        http.authorizeHttpRequests(a -> {
                    a.requestMatchers(AUTH_API_PREFIX + "/**", PUBLIC_API_PREFIX + "/**").permitAll()
                            .requestMatchers(ADMIN_API_PREFIX + "/**")
                            .hasAnyAuthority(ADMIN_ROLE)
                            .requestMatchers(PRIVATE_API_PREFIX + "/**")
                            .hasAnyAuthority(USER_ROLE, ADMIN_ROLE)
                            .anyRequest().permitAll();
                })
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // We have our own mechanism
    @Bean
    UserDetailsService emptyDetailsService() {
        return username -> {
            throw new UnsupportedOperationException();
        };
    }

    @Bean
    TokenCodec tokenCodec() {
        return new JwtTokenCodec(props.getSecret(), clock);
    }

    @Bean
    UserProvider userProvider(UserService userService) {
        return new CustomUserProvider(userService);
    }

}
