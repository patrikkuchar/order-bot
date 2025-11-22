package kuhcorp.dataseeding;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeedingCliRunner implements CommandLineRunner {

    private final DataSeedingService userDataSeeder;

    @Override
    public void run(String... args) {

        var profile = DataSeedingProfile.STANDARD;
        // TODO first test how much it decreases the test setup time
        if (isCi()) {
            profile = DataSeedingProfile.MINIMAL;
        }

        userDataSeeder.runSeed(profile);
    }

    private boolean isCi() {
        var ci = System.getenv("CI");
        var isCi = ci != null && ci.equalsIgnoreCase("true");
        return isCi;
    }
}
