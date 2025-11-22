package kuhcorp.template.db;

import kuhcorp.template.db.querydsl.RepoImpl;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(repositoryBaseClass = RepoImpl.class, basePackages = "kuhcorp.template")
@EntityScan(basePackages = "kuhcorp.template")
public class JpaConfig {
}
