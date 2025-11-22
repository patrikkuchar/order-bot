package kuhcorp.template.api;

public record ApiError(String code, String message) {
    @Override
    public String toString() {
        return "{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}";
    }
}
