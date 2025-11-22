package kuhcorp.template.db.querydsl;

import com.querydsl.core.types.EntityPath;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Predicate;
import com.querydsl.jpa.impl.JPAQuery;
import jakarta.persistence.EntityManager;
import kuhcorp.template.api.PageReq;
import kuhcorp.template.db.EntityWithStatus;
import kuhcorp.template.db.Repo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.data.querydsl.SimpleEntityPathResolver;
import org.springframework.data.support.PageableExecutionUtils;

import java.util.List;
import java.util.Optional;

import static kuhcorp.template.db.DbEntityNotFound.dbEntityNotFound;

public class RepoImpl<ENTITY, ID> extends SimpleJpaRepository<ENTITY, ID> implements Repo<ENTITY, ID> {

    private final JpaEntityInformation<ENTITY, ?> meta;
    private final EntityPath<ENTITY> path;

    private final MyQueryDsl myQueryDsl;

    public RepoImpl(JpaEntityInformation<ENTITY, ?> entityInformation,
                    EntityManager em
    ) {
        super(entityInformation, em);
        this.meta = entityInformation;
        path = SimpleEntityPathResolver.INSTANCE.createPath(entityInformation.getJavaType());
        myQueryDsl = new MyQueryDsl(em);

    }

    @Override
    public ENTITY getExistingById(ID id) {
        return super.findById(id).orElseThrow(() -> dbEntityNotFound(meta.getJavaType(), id + ""));
    }

    @Override
    public ENTITY fetchExisting(JPAQuery<ENTITY> q) {
        var res = q.fetchOne();
        if (res == null)
            throw dbEntityNotFound(meta.getJavaType().toString());
        return res;
    }

    @Override
    public Optional<ENTITY> fetchOneOptionalActive(JPAQuery<ENTITY> q) {
        var res = q.fetchOne();
        if (res == null || !isActive(res)) {
            return Optional.empty();
        }
        return Optional.of(res);
    }

    @Override
    public ENTITY getActiveById(ID id) {
        var e = getExistingById(id);
        if (isActive(e)) {
            return e;
        }
        throw dbEntityNotFound(meta.getJavaType(), id + "");
    }

    @Override
    public Boolean existsActive(Predicate pred) {
        var q = select().where(pred).fetchOne();
        return isActive(q);
    }

    @Override
    public JPAQuery<ENTITY> select() {
        return (JPAQuery<ENTITY>) query().from(path);
    }

    @Override
    public JPAQuery<?> query() {
        return myQueryDsl.query();
    }

    @Override
    public <T> Page<T> getPage(PageQuery<T> pageQuery, PageReq p) {
        var q = pageQuery.getQuery();
        // Check if the count for this query will be done in db (not in memory after fetching all)
        var meta = q.getMetadata();
        if (meta.getHaving() != null || meta.getGroupBy().size() > 1) {
            throw new IllegalArgumentException("Cannot do effective QueryDSL pagination for the query because of either 'having' or 'group by'");
        }

        var pageable = PageRequest.of(p.getNumber(), p.getSize());

        var count = q.clone();

        count.offset(pageable.getOffset());
        count.limit(pageable.getPageSize());

        var contentQuery = pageQuery.getApplyOnContentQuery().apply(q);
        contentQuery.offset(pageable.getOffset());
        contentQuery.limit(pageable.getPageSize());

        return PageableExecutionUtils.getPage(contentQuery.fetch(), pageable, count::fetchCount);
    }

    @Override
    public List<ENTITY> getAll(Predicate pred) {
        return select().where(pred).fetch();
    }

    private boolean isActive(ENTITY e) {
        return (e instanceof EntityWithStatus) && ((EntityWithStatus) e).isActive();
    }
}
