package kuhcorp.dataseeding.domain.test;

import kuhcorp.dataseeding.DbHelper;
import kuhcorp.dataseeding.data.DataGenerator;
import kuhcorp.orderbot.domain.test.*;
import kuhcorp.orderbot.domain.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataSeeder {

    private final TestRepo repo;
    private final DbHelper db;
    private final DataGenerator gen;

    public void seedAll(Collection<User> users) {
        log.info("Seeding Test Entities");
        users.forEach(u -> {
            var t = TestEntity.create(TestDtos.TestEntityDto.builder()
                    .title(gen.title())
                    .description(gen.description())
                    .category(gen.oneOf(TestEntity.Category.class))
                    .logisticProp(TestDtos.TestEntityLogisticProp.builder()
                            .stockCount(gen.integer())
                            .price(gen.bigDecimal())
                            .build())
                    .available(true)
                    .borrows(genBorrows())
                    .build(), u);
            repo.save(t);
        });
    }

    private Set<TestEntityProperty> genBorrows() {
        var num = gen.integer(2, 5);
        return IntStream.range(0, num)
                .mapToObj(i -> TestEntityProperty.builder()
                        .email(gen.email())
                        .note(gen.description())
                        .build())
                .collect(Collectors.toSet());
    }

    public void deleteAll() {
        log.info("Dropping Test Entities");
        db.deleteAll(QTestEntity.testEntity);
    }
}
