package kuhcorp.dataseeding.domain.user;

import kuhcorp.dataseeding.data.DataGenerator;
import kuhcorp.dataseeding.domain.user.UserDataHelper.SeedUserReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.stream.IntStream;

@Component
@RequiredArgsConstructor
public class UserDataSet {

    private final DataGenerator dataGen;
    //TODO: update TEMPLATE with id in user seeding
    public Collection<SeedUserReq> users() {
        return List.of(
                SeedUserReq.builder()
                        .id("72439bb7-a739-42bd-8327-0bae849f0656")
                        .firstName("Alice")
                        .lastName("Doe")
                        .email("alice@email.com")
                        .build(),
                SeedUserReq.builder()
                        .id("45a91d97-f252-4688-bbff-4ad3ed169a20")
                        .firstName("Bob")
                        .lastName("Doe")
                        .email("bob@email.com")
                        .build(),
                SeedUserReq.builder()
                        .id("d3b07384-d9a1-4f5d-8c2d-6c8e0f2f4f5a")
                        .firstName("Admin")
                        .lastName("Adminovic")
                        .email("admin@email.com")
                        .isAdmin(true)
                        .build()
        );
    }

    public Collection<SeedUserReq> simpleUsers(int count) {
        return userSet(count, n -> SeedUserReq.builder()
                .id(dataGen.uuid())
                .firstName(dataGen.firstName())
                .lastName("Simple")
                .email(String.format("simple-%s@email.com", n))
                .build()
        );
    }

    public Collection<SeedUserReq> withTestEntityUsers(int count) {
        return userSet(count, n -> SeedUserReq.builder()
                .id(dataGen.uuid())
                .firstName(dataGen.firstName())
                .lastName("Test")
                .email(String.format("test-%s@email.com", n))
                .build()
        );
    }

    private Collection<SeedUserReq> userSet(int count, Function<Integer, SeedUserReq> create) {
        return IntStream.range(1, count + 1)
                .mapToObj(create::apply)
                .toList();
    }
}
