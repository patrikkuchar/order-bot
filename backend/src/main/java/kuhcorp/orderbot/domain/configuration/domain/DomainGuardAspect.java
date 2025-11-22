package kuhcorp.orderbot.domain.configuration.domain;

import kuhcorp.orderbot.api.BadRequestApiError;
import kuhcorp.orderbot.auth.userHolder.RequestUserHolder;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Optional;

@Aspect
@Component
@RequiredArgsConstructor
public class DomainGuardAspect {

    private final ObjectProvider<RequestUserHolder> userHolderProvider;

    @Around("@within(kuhcorp.orderbot.domain.configuration.domain.DomainMapping)"
            + " || @annotation(kuhcorp.orderbot.domain.configuration.domain.DomainMapping)")
    public Object ensureDomainAllowed(ProceedingJoinPoint joinPoint) throws Throwable {
        var method = resolveMethod(joinPoint);
        if (method == null || isGuardMethod(method)) {
            return joinPoint.proceed();
        }

        var mapping = resolveMapping(method, joinPoint.getTarget());
        if (mapping.isEmpty()) {
            return joinPoint.proceed();
        }

        var guard = resolveGuard(joinPoint.getTarget());
        if (guard.isEmpty()) {
            return joinPoint.proceed();
        }

        var userId = currentUserId();
        if (!guard.get().isDomainAllowed(userId)) {
            throw new AccessDeniedException(
                    "Domain %s is not enabled for the current user".formatted(mapping.get().value()));
        }

        return joinPoint.proceed();
    }

    private Method resolveMethod(ProceedingJoinPoint joinPoint) {
        var signature = joinPoint.getSignature();
        if (!(signature instanceof MethodSignature methodSignature)) {
            return null;
        }
        return AopUtils.getMostSpecificMethod(methodSignature.getMethod(), joinPoint.getTarget().getClass());
    }

    private boolean isGuardMethod(Method method) {
        return method.getName().equals("isDomainAllowed")
                && method.getParameterCount() == 1
                && method.getParameterTypes()[0].equals(Optional.class);
    }

    private Optional<DomainMapping> resolveMapping(Method method, Object target) {
        var mapping = AnnotationUtils.findAnnotation(method, DomainMapping.class);
        if (mapping != null) {
            return Optional.of(mapping);
        }
        var targetClass = AopUtils.getTargetClass(target);
        return Optional.ofNullable(AnnotationUtils.findAnnotation(targetClass, DomainMapping.class));
    }

    private Optional<DomainGuard> resolveGuard(Object target) {
        if (target instanceof DomainGuard guard) {
            return Optional.of(guard);
        }
        return Optional.empty();
    }

    private Optional<String> currentUserId() {
        try {
            var holder = userHolderProvider.getIfAvailable();
            if (holder == null || holder.isSystemExecution() || !holder.isUserPresent()) {
                return Optional.empty();
            }
            return Optional.of(holder.getUserId());
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }

    @BadRequestApiError(value = "ACCESS_DENIED")
    private static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException(String message) {
            super(message);
        }
    }
}
