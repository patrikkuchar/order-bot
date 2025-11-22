package kuhcorp.orderbot.domain.test;

import kuhcorp.orderbot.api.PageReq;
import kuhcorp.orderbot.domain.configuration.domain.DomainGuard;
import kuhcorp.orderbot.domain.configuration.domain.DomainMapping;
import kuhcorp.orderbot.domain.test.TestDtos.TestEntityDto;
import kuhcorp.orderbot.domain.test.TestDtos.TestEntityRes;
import kuhcorp.orderbot.domain.test.TestDtos.TestItemDto;
import kuhcorp.orderbot.domain.test.TestRepo.TestItemListFilter;
import kuhcorp.orderbot.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static kuhcorp.orderbot.domain.configuration.domain.Domains.TEST;

@Component
@RequiredArgsConstructor
@DomainMapping(TEST)
public class TestService implements DomainGuard {

    private final TestRepo repo;
    private final UserService userSvc;

    @Transactional
    public TestEntityRes get(String userId) {
        return TestEntityRes.builder()
                .entity(repo.getByUserId(userId))
                .build();
    }

    @Transactional
    public void update(TestEntityDto req, String userId) {
        var t = repo.findByUserId(userId);
        if (t.isPresent()) {
            t.get().update(req);
            return;
        }

        var e = TestEntity.create(req, userSvc.get(userId));
        repo.save(e);
    }

    public Page<TestItemDto> list(PageReq req, TestItemListFilter filter) {
        return repo.listAllAvailable(req, filter);
    }

    public List<TestItemDto> listTop() {
        return repo.listTop(10);
    }

    @Override
    public boolean isDomainAllowed(Optional<String> userId) {
        var user = userId.map(userSvc::get);
        return user.map(u -> !u.getIsAdmin())
                .orElse(true);
    }
}
