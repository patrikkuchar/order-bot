package kuhcorp.dataseeding;

import kuhcorp.orderbot.data.EncryptedDataConverter;
import kuhcorp.orderbot.data.EncryptionEncoder;
import kuhcorp.orderbot.data.HashEncoder;
import kuhcorp.orderbot.db.DbConfig;
import kuhcorp.orderbot.domain.configuration.attributes.AttributesProvider;
import org.springframework.boot.ApplicationContextFactory;
import org.springframework.boot.Banner;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({
        AttributesProvider.class,
        EncryptedDataConverter.class,
        EncryptionEncoder.class,
        HashEncoder.class,
        DbConfig.class
})
public class DataSeedingApp {

    public static void run(String[] args) {
        new SpringApplicationBuilder(DataSeedingApp.class)
                .bannerMode(Banner.Mode.OFF)
                .contextFactory(ApplicationContextFactory.ofContextClass(AnnotationConfigApplicationContext.class))
                .web(WebApplicationType.NONE)
                .run(args);

        System.out.println("Data seeding done");
    }
}
