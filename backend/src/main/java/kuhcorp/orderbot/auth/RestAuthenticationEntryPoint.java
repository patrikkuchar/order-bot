package kuhcorp.orderbot.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kuhcorp.orderbot.api.ApiExceptionHelper;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        var err = ApiExceptionHelper.decode(authException);
        response.setStatus(err.getStatus());
        response.setContentType("application/json");
        response.getWriter().write(err.getBody());
    }
}
