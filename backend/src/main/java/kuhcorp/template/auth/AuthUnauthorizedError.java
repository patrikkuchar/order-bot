package kuhcorp.template.auth;

import kuhcorp.template.api.HttpApiError;
import org.springframework.core.annotation.AliasFor;

import java.lang.annotation.*;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@HttpApiError(httpStatus = UNAUTHORIZED, code = "AUTH_UNAUTHORIZED")
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface AuthUnauthorizedError {

    @AliasFor(annotation = HttpApiError.class, attribute = "code")
    String value() default "AUTH_UNAUTHORIZED";
}
