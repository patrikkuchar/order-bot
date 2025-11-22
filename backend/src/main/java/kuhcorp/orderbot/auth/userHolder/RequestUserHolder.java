package kuhcorp.orderbot.auth.userHolder;

import kuhcorp.orderbot.auth.AuthUserService;
import kuhcorp.orderbot.auth.CurrentUserHolder;
import kuhcorp.orderbot.auth.UserProvider;
import kuhcorp.orderbot.domain.user.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Optional;

@Component
@RequestScope
@RequiredArgsConstructor
public class RequestUserHolder implements CurrentUserHolder {

    private final AuthUserService authSvc;
    private final UserProvider userProvider;

    private String currentUserId;
    private User user;

    @Getter
    private boolean systemExecution = false;

    public void markSystemExecution() {
        this.systemExecution = true;
    }

    public void clearSystemExecution() {
        this.systemExecution = false;
    }

    public String getUserId() {
        if (currentUserId != null)
            return currentUserId;
        var ctx = authSvc.getUserContext();
        currentUserId = userProvider.getUserId(ctx);

        return currentUserId;
    }

    public boolean isUserWithId(String userId) {
        if (authSvc.isAnonymous())
            return false;

        return getUserId().equals(userId);
    }

    public String getUsername() {
        return getUser().getUsername();
    }

    public boolean isUserPresent() {
        return authSvc.hasUserContext() && !authSvc.isAnonymous();
    }

    public Optional<User> getMaybeUser() {
        if (!isUserPresent())
            return Optional.empty();
        return Optional.of(getUser());
    }

    public boolean isAdmin() {
        if (authSvc.isAnonymous())
            return false;
        return authSvc.getUserContext().role().isAdmin();
    }

    private User getUser() {
        if (user != null)
            return user;
        var ctx = authSvc.getUserContext();
        user = userProvider.getUser(ctx);
        return user;
    }
}
