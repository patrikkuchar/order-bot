package kuhcorp.orderbot.db;

import com.querydsl.core.types.Predicate;
import com.querydsl.jpa.impl.JPAQuery;
import kuhcorp.orderbot.api.PageReq;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@NoRepositoryBean
public interface Repo<ENTITY, ID> extends JpaRepository<ENTITY, ID> {

    ENTITY getExistingById(ID id);

    ENTITY getActiveById(ID id);

    ENTITY fetchExisting(JPAQuery<ENTITY> q);

    ENTITY fetchActive(Predicate pred);

    Optional<ENTITY> fetchOneOptionalActive(JPAQuery<ENTITY> q);

    default Optional<ENTITY> fetchOneOptionalActive(Predicate pred) {
        return fetchOneOptionalActive(select().where(pred));
    }

    default ENTITY fetchExisting(Predicate pred) {
        return fetchExisting(select().where(pred));
    }

    default Optional<ENTITY> fetchOneOptional(Predicate pred) {
        var res = select().where(pred).fetchOne();
        return Optional.ofNullable(res);
    }

    Boolean existsActive(Predicate pred);

    JPAQuery<ENTITY> select();

    JPAQuery<?> query();

    <T> Page<T> getPage(PageQuery<T> pageQuery, PageReq p);

    List<ENTITY> getAll(Predicate pred);

    @Value(staticConstructor = "of")
    class PageQuery<T> {

        JPAQuery<T> query;

        Function<JPAQuery<T>, JPAQuery<T>> applyOnContentQuery;

    }
}
