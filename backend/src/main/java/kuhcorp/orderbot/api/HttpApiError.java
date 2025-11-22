package kuhcorp.orderbot.api;

import org.springframework.http.HttpStatus;

import java.lang.annotation.Retention;

import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Retention(RUNTIME)
public @interface HttpApiError {

    String code();

    HttpStatus httpStatus();
}
