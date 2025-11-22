package kuhcorp.dataseeding;

import kuhcorp.dataseeding.domain.test.TestDataSeeder;
import kuhcorp.dataseeding.domain.user.UserDataSeeder;
import kuhcorp.orderbot.domain.configuration.attributes.AttributesProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static kuhcorp.orderbot.domain.configuration.attributes.Attributes.AttributeType.SEED_VERSION;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeedingService {

    private final String version = DatasetVersion.VERSION;
    private final AttributesProvider attributesProvider;

    private final UserDataSeeder userSeeder;
    private final TestDataSeeder testSeeder;

    @Transactional
    public void runSeed(DataSeedingProfile profile) {
        log.info("Running data seeding");
        if (isDataSeedCurrent()) {
            log.info("Seeded dataset is up to date. Will not seed data.");
            return;
        }

        dropData();
        seedData(profile);

        updateSeedDataVersion();

        log.info("Seeding done");
    }

    private void seedData(DataSeedingProfile p) {
        var users = userSeeder.seedAll(p);
        testSeeder.seedAll(users.test());
    }

    private void dropData() {
        testSeeder.deleteAll();
        userSeeder.dropAll();
    }

    private boolean isDataSeedCurrent() {
        var currentVersion = getSeededDataVersionInDb();
        return currentVersion.isPresent() && currentVersion.get().equals(version);
    }

    private Optional<String> getSeededDataVersionInDb() {
        return attributesProvider.get(SEED_VERSION);
    }

    private void updateSeedDataVersion() {
        attributesProvider.set(SEED_VERSION, version);
    }
}
