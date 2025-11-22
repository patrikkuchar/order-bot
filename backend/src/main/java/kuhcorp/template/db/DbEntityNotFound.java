package kuhcorp.template.db;

import kuhcorp.template.api.HttpApiError;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@HttpApiError(httpStatus = NOT_FOUND, code = "ENTITY_NOT_FOUND")
public class DbEntityNotFound extends RuntimeException {

    public DbEntityNotFound(String msg) {
        super(msg);
    }

    public static DbEntityNotFound dbEntityNotFound(String msg) {
        return new DbEntityNotFound(msg);
    }

    public static DbEntityNotFound dbEntityNotFound(Class<?> type, String id) {
        return new DbEntityNotFound(String.format("%s with id %s not found", type.getSimpleName(), id));
    }

    public static DbEntityNotFound dbEntityNotFound(Class<?> type, Long id) {
        return dbEntityNotFound(type, id + "");
    }
}
