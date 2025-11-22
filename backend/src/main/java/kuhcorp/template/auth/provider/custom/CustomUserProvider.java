package kuhcorp.template.auth.provider.custom;

import kuhcorp.template.auth.AuthUserService.UserContext;
import kuhcorp.template.auth.UserProvider;
import kuhcorp.template.domain.user.User;
import kuhcorp.template.domain.user.UserService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserProvider implements UserProvider {

    private final UserService userService;

    @Override
    public String getUserId(UserContext ctx) {
        return ctx.userId();
    }

    @Override
    public User getUser(UserContext ctx) {
        return userService.get(ctx.userId());
    }
}
