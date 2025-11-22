package kuhcorp.template.domain.test;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import kuhcorp.template.domain.test.TestEntity.Category;
import lombok.Builder;
import lombok.Getter;
import lombok.Value;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

public class TestDtos {

    @Value(staticConstructor = "of")
    public static class TestRes {

        @NotNull
        String userFullName;

        @NotNull
        Boolean isAdmin;
    }

    @Builder
    @Getter
    public static class TestEntityRes {

        private Optional<TestEntityDto> entity;
    }

    @Value(staticConstructor = "of")
    @Builder
    public static class TestEntityDto {

        @NotEmpty
        @Size(max = 150)
        String title;

        @Size(max = 300)
        String description;

        @NotNull
        Category category;

        @NotNull
        @Valid
        TestEntityLogisticProp logisticProp;

        @NotNull
        boolean available;

        @Valid
        @NotNull
        Set<TestEntityProperty> borrows;
    }

    @Builder
    @Getter
    public static class TestEntityLogisticProp {
        @NotNull
        @Min(0)
        private Integer stockCount;

        //TODO: money
        @NotNull
        @DecimalMin("0.0")
        private BigDecimal price;
    }

    @Builder
    @Getter
    public static class TestItemDto {
        @NotEmpty
        @Size(max = 150)
        String title;

        @NotNull
        Category category;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal price;
    }
}
