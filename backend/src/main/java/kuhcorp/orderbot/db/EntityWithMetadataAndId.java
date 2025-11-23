package kuhcorp.orderbot.db;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
@MappedSuperclass
@ToString(onlyExplicitlyIncluded = true)
public abstract class EntityWithMetadataAndId extends EntityWithMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Getter
    private String id;
}
