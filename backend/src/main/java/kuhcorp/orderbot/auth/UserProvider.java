package kuhcorp.orderbot.auth;

import kuhcorp.orderbot.auth.AuthUserService.UserContext;
import kuhcorp.orderbot.domain.user.User;

public interface UserProvider {

    String getUserId(UserContext ctx);

    User getUser(UserContext ctx);
}
