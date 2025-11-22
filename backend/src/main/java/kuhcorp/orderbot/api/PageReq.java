package kuhcorp.orderbot.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Data
public class PageReq {

    @NotNull
    private Integer number;

    @NotNull
    private Integer size;

    @JsonIgnore
    public long getOffset() {
        return (long) number * (long) size;
    }

    public static PageReq of(int pageNumber, int size) {
        var r = new PageReq();
        r.number = pageNumber;
        r.size = size;

        return r;
    }

    public Pageable toPageable() {
        return PageRequest.of(number, size);
    }

}
