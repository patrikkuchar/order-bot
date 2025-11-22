package kuhcorp.template.auth;

import kuhcorp.template.auth.AuthUserService.UserContext;
import kuhcorp.template.domain.user.User;

public interface UserProvider {

    String getUserId(UserContext ctx);

    User getUser(UserContext ctx);
}
