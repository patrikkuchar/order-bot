package kuhcorp.orderbot.auth.provider.custom;

import kuhcorp.orderbot.auth.AuthUserService.UserContext;
import kuhcorp.orderbot.auth.UserProvider;
import kuhcorp.orderbot.domain.user.User;
import kuhcorp.orderbot.domain.user.UserService;
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
