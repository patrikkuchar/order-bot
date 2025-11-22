package kuhcorp.template.domain.test;

import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.EnumPath;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.StringPath;
import kuhcorp.template.api.PageReq;
import kuhcorp.template.db.Repo;
import kuhcorp.template.db.querydsl.filter.DecimalRange;
import kuhcorp.template.db.querydsl.filter.ListFilter;
import kuhcorp.template.domain.test.TestDtos.TestEntityDto;
import kuhcorp.template.domain.test.TestDtos.TestItemDto;
import kuhcorp.template.domain.test.TestEntity.Category;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static kuhcorp.template.domain.test.QTestEntity.testEntity;

@Repository
public interface TestRepo extends Repo<TestEntity, String> {

    default Optional<TestEntityDto> getByUserId(String userId) {
        var t = findByUserId(userId);
        return t.map(v -> TestEntityDto.builder()
                .title(v.getTitle())
                .description(v.getDescription())
                .category(v.getCategory())
                .logisticProp(TestDtos.TestEntityLogisticProp.builder()
                        .stockCount(v.getStockCount())
                        .price(v.getPrice())
                        .build())
                .available(v.isActive())
                .borrows(v.getBorrows())
                .build());
    }

    default Optional<TestEntity> findByUserId(String userId) {
        return fetchOneOptional(testEntity.owner.id.eq(userId));
    }

    default Page<TestItemDto> listAllAvailable(PageReq req, TestItemListFilter filter) {
        var q = query()
                .select(testEntity.title, testEntity.category, testEntity.price)
                .from(testEntity);

        q = q.where(filterPred(filter));

        q = q.where(testEntity.available.eq(true));

        var p = getPage(PageQuery.of(q, content -> content), req);

        return p.map(r -> TestItemDto.builder()
                .title(r.get(testEntity.title))
                .category(r.get(testEntity.category))
                .price(r.get(testEntity.price))
                .build());
    }

    default List<TestItemDto> listTop(int limit) {
        return query()
                .select(testEntity.title, testEntity.category, testEntity.price)
                .from(testEntity)
                .where(testEntity.available.eq(true))
                .orderBy(testEntity.createdAt.desc())
                .limit(limit)
                .fetch()
                .stream()
                .map(r -> TestItemDto.builder()
                        .title(r.get(testEntity.title))
                        .category(r.get(testEntity.category))
                        .price(r.get(testEntity.price))
                        .build())
                .toList();
    }

    private static Predicate filterPred(TestItemListFilter filter) {
        return filter.toPredicate(TestItemListFilter.Fields.builder()
                        .title(testEntity.title)
                        .category(testEntity.category)
                        .price(testEntity.price)
                .build());
    }

    @Data
    class TestItemListFilter extends ListFilter<TestItemListFilter.Fields> {

        private String title;

        private Collection<Category> categories;

        private DecimalRange priceRange;

        @Override
        protected void apply(Fields fs) {
            contains(title, fs.title);
            in(categories, fs.category);
            between(priceRange, fs.price);
        }

        @Builder
        public static class Fields {

            @NonNull
            StringPath title;

            @NonNull
            EnumPath<Category> category;

            @NonNull
            NumberPath<BigDecimal> price;
        }
    }
}
