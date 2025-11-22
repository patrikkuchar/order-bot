package kuhcorp.orderbot.domain.test;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import kuhcorp.orderbot.data.EncryptedDataConverter;
import kuhcorp.orderbot.db.EntityWithMetadata;
import kuhcorp.orderbot.db.EntityWithStatus;
import kuhcorp.orderbot.domain.test.TestDtos.TestEntityDto;
import kuhcorp.orderbot.domain.user.User;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Set;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
public class TestEntity extends EntityWithMetadata implements EntityWithStatus {

    @NotNull
    @OneToOne(fetch = LAZY)
    private User owner;

    @NotBlank
    @Size(max = 150)
    private String title; // napr. názov knihy / produktu

    @Size(max = 500)
    @Convert(converter = EncryptedDataConverter.class)
    private String description; // stručný popis

    @NotNull
    @Enumerated(EnumType.STRING)
    private Category category; // typ / žáner / skupina

    @NotNull
    @Min(0)
    private Integer stockCount; // počet kusov na sklade

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price; // cena alebo hodnota

    @NotNull
    private boolean available = true; // dostupnosť

    @Valid
    @ElementCollection(fetch = LAZY)
    @OrderBy("email")
    @CollectionTable(name = "test_entity_borrows")
    private Set<TestEntityProperty> borrows; // vlastnosti prepožičaných položiek

    public static TestEntity create(TestEntityDto req, User user) {
        var e = new TestEntity();
        e.owner = user;
        e.update(req);
        return e;
    }

    public void update(TestEntityDto req) {
        title = req.getTitle();
        description = req.getDescription();
        category = req.getCategory();
        stockCount = req.getLogisticProp().getStockCount();
        price = req.getLogisticProp().getPrice();
        available = req.isAvailable();
        borrows = req.getBorrows();
    }

    public enum Category {
        BOOK,
        ELECTRONICS,
        CLOTHING,
        TOY
    }

    @Override
    public boolean isActive() {
        return available;
    }
}
