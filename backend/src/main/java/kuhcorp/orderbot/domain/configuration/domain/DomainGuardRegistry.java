package kuhcorp.orderbot.domain.configuration.domain;

import java.util.*;

import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class DomainGuardRegistry {

    private final Map<Domains, DomainGuard> registry;

    @Autowired
    public DomainGuardRegistry(ApplicationContext ctx) {
        Map<String, DomainGuard> beans = ctx.getBeansOfType(DomainGuard.class);
        Map<Domains, DomainGuard> tmp = new EnumMap<>(Domains.class);
        beans.forEach((name, bean) -> {
            Class<?> targetClass = AopUtils.getTargetClass(bean);
            var mapping = targetClass.getAnnotation(DomainMapping.class);
            if (mapping != null) {
                tmp.put(mapping.value(), bean);
                return;
            }
            // fallback: try to match bean name to enum constant
            try {
                Domains d = Domains.valueOf(name.toUpperCase());
                tmp.put(d, bean);
            } catch (IllegalArgumentException ex) {
                // ignore - no mapping found
            }
        });
        this.registry = Collections.unmodifiableMap(tmp);
    }

    public Collection<Domains> getEnabledDomains(Optional<String> userId) {
        var enabled = new ArrayList<Domains>();
        registry.forEach((domain, guard) -> {
            if (guard.isDomainAllowed(userId)) enabled.add(domain);
        });
        return enabled;
    }

    public Optional<DomainGuard> get(Domains domain) {
        return Optional.ofNullable(registry.get(domain));
    }

    public Map<Domains, DomainGuard> getAll() {
        return registry;
    }
}
