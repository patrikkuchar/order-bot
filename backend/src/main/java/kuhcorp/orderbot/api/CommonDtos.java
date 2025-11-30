package kuhcorp.orderbot.api;

import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import lombok.Value;

public class CommonDtos {

    @Value(staticConstructor = "of")
    public static class StringDto {
        @NotNull
        @NonNull
        String value;
    }
}
