package kuhcorp.template.auth.userHolder;

import kuhcorp.template.auth.CurrentUserHolder;

public class SystemUserHolder implements CurrentUserHolder {
    @Override
    public String getUsername() {
        return "system";
    }
}
