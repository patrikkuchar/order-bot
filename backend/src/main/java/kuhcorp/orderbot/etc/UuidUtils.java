package kuhcorp.orderbot.etc;

public class UuidUtils {

    public static String gen() {
        return java.util.UUID.randomUUID().toString();
    }
}
