package kuhcorp.template.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.springframework.data.domain.Page;

import java.util.Collection;

import static lombok.AccessLevel.PRIVATE;

@Getter
@NoArgsConstructor(access = PRIVATE)
public class PageDto<T> {

    @NotNull
    @Valid
    private Collection<T> content;

    @NotNull
    @Valid
    private PageMetadata page;

    public static <T> PageDto<T> of(Page<T> page) {
        PageDto<T> dto = new PageDto<>();
        dto.content = page.getContent();

        PageMetadata meta = new PageMetadata();
        meta.size = Long.valueOf(page.getSize());
        meta.number = Long.valueOf(page.getNumber());
        meta.totalElements = Long.valueOf(page.getTotalElements());
        meta.totalPages = Integer.valueOf(page.getTotalPages());

        dto.page = meta;
        return dto;
    }

    @Getter
    public static class PageMetadata {

        @NotNull
        private Long size;

        @NotNull
        private Long number;

        @NotNull
        private Long totalElements;

        @NotNull
        private Integer totalPages;
    }
}
