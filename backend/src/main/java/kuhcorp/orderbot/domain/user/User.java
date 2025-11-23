package kuhcorp.orderbot.domain.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import kuhcorp.orderbot.auth.provider.custom.AuthDtos.RegisterReq;
import kuhcorp.orderbot.db.EntityWithMetadata;
import kuhcorp.orderbot.db.EntityWithMetadataAndId;
import kuhcorp.orderbot.db.EntityWithStatus;
import kuhcorp.orderbot.etc.UuidUtils;
import lombok.Getter;

import static jakarta.persistence.EnumType.STRING;

@Entity
@Table(name = "app_user")
public class User extends EntityWithMetadata implements EntityWithStatus {

    @Id
    @Getter
    private String id;

    @NotNull
    @Getter
    private String email;

    @NotNull
    @Getter
    private String passwordHash;

    @Getter
    private String firstName;

    @Getter
    private String lastName;

    @NotNull
    @Getter
    private Boolean isAdmin;

    @NotNull
    @Enumerated(STRING)
    private UserStatus status;

    public static User create(RegisterReq req, String passwordHash) {
        return create(UuidUtils.gen(), req, passwordHash, false);
    }

    public static User create(String id, RegisterReq req, String passwordHash, boolean admin) {
        var u = new User();
        u.id = id;
        u.email = req.getEmail();
        u.passwordHash = passwordHash;
        u.firstName = req.getFirstName();
        u.lastName = req.getLastName();
        u.isAdmin = admin;
        u.status = UserStatus.ACTIVE;
        return u;
    }

    public String getUsername() {
        return email;
    }

    @Override
    public boolean isActive() {
        return status.isActive();
    }
}
