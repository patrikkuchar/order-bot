package kuhcorp.dataseeding.domain.user;

import kuhcorp.dataseeding.DataSeedingProfile;
import kuhcorp.dataseeding.DbHelper;
import kuhcorp.template.domain.user.QUser;
import kuhcorp.template.domain.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserDataSeeder {

    private final UserDataSet dataSet;
    private final UserDataHelper dataHelper;
    private final DbHelper db;

    public UserSeedResult seedAll(DataSeedingProfile profile) {
        log.info("Seeding Users");

        dataSet.users().forEach(dataHelper::createAndPersist);

        var userGroupsCount = DataSeedingProfile.MINIMAL.equals(profile) ? 5 : 50;

        var withTestEntityUsers = dataSet.withTestEntityUsers(userGroupsCount)
                .stream().map(dataHelper::createAndPersist)
                .toList();

        dataSet.simpleUsers(userGroupsCount).forEach(dataHelper::createAndPersist);

        return new UserSeedResult(withTestEntityUsers);
    }

    public void dropAll() {
        log.info("Dropping Users");
        db.deleteAll(QUser.user);
    }

    public record UserSeedResult(Collection<User> test) {
    }
}
