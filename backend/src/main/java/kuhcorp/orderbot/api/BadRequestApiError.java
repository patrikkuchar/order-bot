package kuhcorp.orderbot.api;

import org.springframework.core.annotation.AliasFor;
import org.springframework.http.HttpStatus;

import java.lang.annotation.*;

@HttpApiError(httpStatus = HttpStatus.BAD_REQUEST, code = "INVALID_REQUEST")
//--
@Documented
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface BadRequestApiError {

    @AliasFor(annotation = HttpApiError.class, attribute = "code")
    String value() default "INVALID_REQUEST";
}
