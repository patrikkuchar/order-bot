package kuhcorp.orderbot.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.core.converter.AnnotatedType;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Schema;
import kuhcorp.orderbot.domain.etc.validation.ValidationProps;
import kuhcorp.orderbot.domain.etc.validation.ValidationProps.ValidationProp;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.PropertyCustomizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Configuration
public class OpenApiConfig {
    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI()
                .info(new Info()
                        .title("My API")
                        .version("unknown")
                        .description("OpenAPI documentation for My API"));
        try {
            String json = objectMapper.writeValueAsString(openAPI);
            String hash = sha1Hex(json);
            openAPI.getInfo().setVersion(hash);
        } catch (JsonProcessingException | NoSuchAlgorithmException e) {
            // fallback: keep version as 'unknown'
        }
        return openAPI;
    }

    @Bean
    public PropertyCustomizer customPropertyCustomizer(ValidationProps props) {
        return (Schema schema, AnnotatedType type) -> {
            var propOpt = findValidationProp(type, props);
            if (propOpt.isPresent()) {
                var prop = propOpt.get();
                schema.setPattern(prop.getPattern());
                prop.getExample().ifPresent(schema::setExample);
                prop.getDefaultMessage().ifPresent(schema::setDescription);
                schema.addExtension("x-localization-key", prop.getLocalizationKey());
            }
            return schema;
        };
    }

    @Bean
    public OpenApiCustomizer customizer() {
        return o -> {
            var schemas = o.getComponents().getSchemas();

            schemas.values().forEach((s) -> {
                var props = s.getProperties();
                if (props == null)
                    return;
                if (props.containsKey("totalPages"))
                    setupApiPageableModel(s);
                if (props.containsKey("page") && props.containsKey("content"))
                    setupPageResponse(s);
            });
        };
    }

    private Optional<ValidationProp> findValidationProp(AnnotatedType type, ValidationProps props) {
        return Arrays.stream(type.getCtxAnnotations())
                .map(a -> props.findByAnnotation(a.annotationType()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .findFirst();
    }

    private String sha1Hex(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private void setupApiPageableModel(Schema<?> s) {
        s.getProperties().remove("sort");
        s.getProperties().remove("pageable");
        s.required(List.of(
                "totalPages", "totalElements", "size",
                "number", "first", "content",
                "first", "last", "numberOfElements", "empty"));
    }

    private void setupPageResponse(Schema<?> s) {
        s.required(List.of("page", "content"));
    }
}
