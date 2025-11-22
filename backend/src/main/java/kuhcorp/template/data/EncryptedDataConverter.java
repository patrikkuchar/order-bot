package kuhcorp.template.data;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

@RequiredArgsConstructor
@Converter(autoApply = false)
public class EncryptedDataConverter implements AttributeConverter<String, String> {

    private final EncryptionEncoder svc;

    @Override
    @SneakyThrows
    public String convertToDatabaseColumn(String s) {
        return svc.encrypt(s);
    }

    @Override
    @SneakyThrows
    public String convertToEntityAttribute(String s) {
        return svc.decrypt(s);
    }
}
