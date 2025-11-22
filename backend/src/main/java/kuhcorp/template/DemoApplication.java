package kuhcorp.template;

import kuhcorp.dataseeding.DataSeedingApp;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Optional;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        var flag = getFirstArg(args);
        if (flag.isEmpty()) {
            runWebApp(args);
            return;
        }
        runTool(flag.get(), args);
    }

    private static void runWebApp(String[] args) {
        var app = new SpringApplication(DemoApplication.class);
        app.run(args);
    }

    private static void runTool(String name, String[] args) {
        if (name.equals("--seed-data")) {
            DataSeedingApp.run(args);
        }
    }

    private static Optional<String> getFirstArg(String[] args) {
        if (args == null || args.length == 0) {
            return Optional.empty();
        }
        return Optional.of(args[0]);
    }

}
