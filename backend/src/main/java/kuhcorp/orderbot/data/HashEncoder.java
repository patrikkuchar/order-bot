package kuhcorp.orderbot.data;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class HashEncoder {

    private final BCryptPasswordEncoder passEncoder = new BCryptPasswordEncoder(10);

    public String encode(String raw) {
        return passEncoder.encode(raw);
    }

    public boolean matches(String raw, String encoded) {
        return passEncoder.matches(raw, encoded);
    }
}
