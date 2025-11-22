package kuhcorp.orderbot.domain.etc.validation;

import lombok.Getter;
import lombok.Value;
import org.springframework.context.annotation.Configuration;

import java.lang.annotation.Annotation;
import java.util.List;
import java.util.Optional;

@Configuration
public class ValidationProps {

    private final ValidationProp email = ValidationProp.of(
            Email.class, EmailValidator.EMAIL_PATTERN,
            "email",
            Optional.of("email@email.com"),
            Optional.of("Is not valid Email")
    );

    @Getter
    private final List<ValidationProp> props = List.of(
            email
    );

    public Optional<ValidationProp> findByAnnotation(Class<? extends Annotation> annotation) {
        return props.stream()
                .filter(p -> p.getAnnotation() == annotation)
                .findFirst();
    }

    @Value(staticConstructor = "of")
    public static class ValidationProp {
        Class<? extends Annotation> annotation;
        String pattern;
        String localizationKey;
        Optional<String> example;
        Optional<String> defaultMessage;
    }
}
