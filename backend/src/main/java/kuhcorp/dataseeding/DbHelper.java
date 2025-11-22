package kuhcorp.dataseeding;

import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.CollectionPathBase;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.EntityManager;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.mapping.PersistentClass;
import org.hibernate.metamodel.mapping.EntityMappingType;
import org.hibernate.persister.entity.AbstractEntityPersister;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.stereotype.Component;

import java.lang.reflect.AnnotatedElement;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DbHelper {

    private final EntityManager em;

    public <T> List<T> findAll(Class<T> entityClazz) {
        var entityName = entityClazz.getSimpleName();
        return em.createQuery(String.format("select cl from %s cl", entityName), entityClazz)
                .getResultList();
    }

    public void deleteRelationship(CollectionPathBase<?, ?, ?> collectionPath) {
        var el = collectionPath.getAnnotatedElement();

        var tableName = tryGetTableNameByJoinTable(el)
                .or(() -> tryGetTableNameByCollectionTable(el))
                .orElse(getTableNameByCollectionAndParent(collectionPath));

        deleteAll(tableName);
    }

    private Optional<String> tryGetTableNameByJoinTable(AnnotatedElement el) {
        var annotation = Optional.ofNullable(el.getAnnotation(JoinTable.class));
        return annotation.map(JoinTable::name);
    }

    private Optional<String> tryGetTableNameByCollectionTable(AnnotatedElement el) {
        var annotation = Optional.ofNullable(el.getAnnotation(CollectionTable.class));
        return annotation.map(CollectionTable::name);
    }

    private String getTableNameByCollectionAndParent(CollectionPathBase<?, ?, ?> collectionPath) {
        var parent = collectionPath.getRoot().getType();
        var parentTableName = getTableName(parent);
        var collectionTableName = collectionPath.getMetadata().getName();
        return String.format("%s_%s", parentTableName, collectionTableName);
    }

    /**
     * Delete all rows from the table represented by the QueryDSL Q-class (Path).
     */
    public void deleteAll(Path<?> qClass) {
        var physicalTableName = getTableName(qClass);
        deleteAll(physicalTableName);
    }

    private String getTableName(Class<?> entityClazz) {
        try {
            Session session = em.unwrap(Session.class);
            SessionFactoryImplementor sfi = (SessionFactoryImplementor) session.getSessionFactory();

            EntityMappingType entityMappingType = sfi.getMappingMetamodel()
                    .findEntityDescriptor(entityClazz);

            if (entityMappingType != null) {
                // Tento persister nie je deprecated a má prístup k tabulkám
                EntityPersister persister = entityMappingType.getEntityPersister();

                // V Hibernate 6.4+ funguje:
                if (persister instanceof AbstractEntityPersister abstractPersister) {
                    return abstractPersister.getTableName(); // hlavná tabuľka
                }
            }

        } catch (Exception ignored) {
        }

        var tableAnnotation = Optional.ofNullable(entityClazz.getAnnotation(Table.class));
        return tableAnnotation.map(Table::name)
                .filter(name -> !name.isBlank())
                .orElse(entityClazz.getSimpleName());
    }

    /**
     * Get the physical table name using QueryDSL Q-class (Path).
     * This uses Hibernate metadata and naming strategy.
     */
    public String getTableName(Path<?> qClass) {
        Class<?> entityClass = qClass.getType();
        return getTableName(entityClass);
    }

    private void deleteAll(String tableName) {
        var sql = String.format("DELETE FROM %s", tableName);
        em.createNativeQuery(sql)
                .executeUpdate();
    }
}
