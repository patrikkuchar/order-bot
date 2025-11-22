package kuhcorp.template.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.Optional;

public class ApiExceptionHelper {

    public static ApiErrorRes decode(Exception ex) {
        if (ex instanceof AuthenticationException) {
            return ApiErrorRes.ofNotLoggedIn(ex.getLocalizedMessage());
        }
        if (ex instanceof AccessDeniedException) {
            return ApiErrorRes.ofInsufficientPermissions(ex.getLocalizedMessage());
        }

        return getHttpApiError(ex)
                .map(err -> ApiErrorRes.of(err.httpStatus(), err.code(), ex.getLocalizedMessage()))
                .orElse(handleOther(ex));
    }

    private static Optional<HttpApiError> getHttpApiError(Exception ex) {
        var inRoot = Optional.ofNullable(ex.getClass().getAnnotation(HttpApiError.class));
        if (inRoot.isPresent())
            return inRoot;

        var annotations = ex.getClass().getAnnotations();
        for (var ann : annotations) {
            if (ann.annotationType().isAnnotationPresent(HttpApiError.class))
                return Optional.of(ann.annotationType().getAnnotation(HttpApiError.class));
        }

        return Optional.empty();
    }

    private static ApiErrorRes handleOther(Exception ex) {
        return ApiErrorRes.ofDefault(ex.getMessage());
    }

    public static class ApiErrorRes {

        private HttpStatus status;
        private ApiError body;

        private ApiErrorRes() { }

        public static ApiErrorRes ofDefault(String message) {
            return of(HttpStatus.INTERNAL_SERVER_ERROR, "UNEXPECTED_ERROR", message);
        }

        public static ApiErrorRes of(HttpStatus status, String code, String message) {
            var r = new ApiErrorRes();
            r.status = status;
            r.body = new ApiError(code, message);
            return r;
        }

        public static ApiErrorRes ofNotLoggedIn(String message) {
            return of(HttpStatus.UNAUTHORIZED, "AUTH_NOT_LOGGED_IN", message);
        }

        public static ApiErrorRes ofInsufficientPermissions(String message) {
            return of(HttpStatus.FORBIDDEN, "AUTH_INSUFFICIENT_PERMISSIONS", message);
        }

        public ResponseEntity<ApiError> toResponseEntity() {
            return ResponseEntity.status(status).body(body);
        }

        public Integer getStatus() {
            return status.value();
        }

        public String getBody() {
            return body.toString();
        }
    }
}
