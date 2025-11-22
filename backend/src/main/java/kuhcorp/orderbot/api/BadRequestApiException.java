package kuhcorp.orderbot.api;

@BadRequestApiError
public class BadRequestApiException extends RuntimeException {
    public BadRequestApiException(String message) {
        super(message);
    }
}
