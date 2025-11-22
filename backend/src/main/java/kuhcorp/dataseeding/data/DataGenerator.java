package kuhcorp.dataseeding.data;

import com.github.javafaker.Faker;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Locale;

@Component
public class DataGenerator {

    private final Faker faker = new Faker(Locale.of("sk"));

    public String firstName() {
        return faker.name().firstName();
    }

    public String lastName() {
        return faker.name().lastName();
    }

    public String email() {
        return faker.internet().emailAddress();
    }

    public String title() {
        return faker.book().title();
    }

    public String description() {
        return faker.lorem().sentence(10);
    }

    public int integer() {
        return randomInt(100);
    }

    public int integer(int max) {
        return randomInt(max);
    }

    public int integer(int min, int max) {
        return randomInt(min, max);
    }

    public BigDecimal bigDecimal() {
        return BigDecimal.valueOf(faker.number().randomDouble(2, 0, 1000));
    }

    public <E extends Enum<E>> E oneOf(Class<E> enumClass) {
        E[] values = enumClass.getEnumConstants();
        return values[randomInt(values.length - 1)];
    }

    private int randomInt(int max) {
        return randomInt(0, max);
    }

    private int randomInt(int min, int max) {
        return faker.random().nextInt(min, max);
    }
}
