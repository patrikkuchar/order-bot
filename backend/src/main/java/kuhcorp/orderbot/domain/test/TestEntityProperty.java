package kuhcorp.orderbot.domain.test;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import kuhcorp.orderbot.domain.etc.validation.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestEntityProperty {

    @NotEmpty
    @Size(max = 100)
    @Email
    private String email;

    @NotEmpty
    @Size(max = 500)
    private String note;
}
