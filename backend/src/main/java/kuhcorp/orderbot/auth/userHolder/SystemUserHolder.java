package kuhcorp.orderbot.auth.userHolder;

import kuhcorp.orderbot.auth.CurrentUserHolder;

public class SystemUserHolder implements CurrentUserHolder {
    @Override
    public String getUsername() {
        return "system";
    }
}
