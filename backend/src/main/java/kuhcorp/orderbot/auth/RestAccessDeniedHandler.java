package kuhcorp.orderbot.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kuhcorp.orderbot.api.ApiExceptionHelper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        var err = ApiExceptionHelper.decode(accessDeniedException);
        response.setStatus(err.getStatus());
        response.setContentType("application/json");
        response.getWriter().write(err.getBody());
    }
}
