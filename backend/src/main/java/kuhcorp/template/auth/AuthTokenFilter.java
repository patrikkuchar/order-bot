package kuhcorp.template.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kuhcorp.template.api.ApiExceptionHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
public class AuthTokenFilter extends OncePerRequestFilter {

    private final TokenCodec codec;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            doFilter(request, response, filterChain);
            filterChain.doFilter(request, response);
        } catch (BadCredentialsException e) {
            log.warn("Bad credentials", e);
        } catch (Exception e) {
            log.error("Failed to process request", e);
            var err = ApiExceptionHelper.decode(e);
            response.setStatus(err.getStatus());
            response.setContentType("application/json");
            response.getWriter().write(err.getBody());
        }

        //filterChain.doFilter(request, response);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var tokenOpt = resolveToken(request);
        if (tokenOpt.isEmpty()) {
            return;
        }

        var authToken = codec.decode(tokenOpt.get());
        var auth = new AuthTokenAuthentication(authToken);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Optional<String> resolveToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            return Optional.of(token.substring(7));
        }
        return Optional.empty();
    }
}
