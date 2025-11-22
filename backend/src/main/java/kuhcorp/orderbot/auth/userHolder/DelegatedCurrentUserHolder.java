package kuhcorp.orderbot.auth.userHolder;

import kuhcorp.orderbot.auth.CurrentUserHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;

@Component
@Primary
@RequiredArgsConstructor
public class DelegatedCurrentUserHolder implements CurrentUserHolder {

    private final CurrentUserHolder systemUserInfoHolder = new SystemUserHolder();
    private final ApplicationContext appCtx;

    private final CurrentUserHolder anonymousUserHolder = () -> {
        return "anonymous"; // Anonymous user
    };

    @Override
    public String getUsername() {
        return getDelegate().getUsername();
    }

    private CurrentUserHolder getDelegate() {
        if (isWebRequest()) {
            var prov = appCtx.getBean(RequestUserHolder.class);
            if (!prov.isUserPresent())
                return anonymousUserHolder;

            if (!prov.isSystemExecution())
                return prov;
        }

        return systemUserInfoHolder;
    }

    public boolean isWebRequest() {
        var attrs = RequestContextHolder.getRequestAttributes();
        return attrs != null;
    }
}
