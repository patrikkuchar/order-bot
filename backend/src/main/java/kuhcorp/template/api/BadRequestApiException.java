package kuhcorp.template.api;

@BadRequestApiError
public class BadRequestApiException extends RuntimeException {
    public BadRequestApiException(String message) {
        super(message);
    }
}
