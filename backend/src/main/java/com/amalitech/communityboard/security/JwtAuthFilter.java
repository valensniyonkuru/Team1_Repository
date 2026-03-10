package com.amalitech.communityboard.security;

import com.amalitech.communityboard.dto.ApiResponse;
import com.amalitech.communityboard.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final TokenBlacklistService tokenBlacklistService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isAccessTokenValid(token)) {
                sendUnauthorized(response, "Invalid or expired token Try Logging in again");
                return;
            }

            String jti = jwtService.extractJti(token);
            if (tokenBlacklistService.isBlacklisted(jti)) {
                sendUnauthorized(response, "Token has been revoked Try Logging in again");
                return;
            }

            String email = jwtService.extractEmail(token);
            int tokenVersion = jwtService.extractVersion(token);

            userRepository.findByEmailAndDeletedAtIsNull(email)
                    .filter(user -> !user.isAccountLocked() && user.getTokenVersion() == tokenVersion)
                    .ifPresent(user -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                user, null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
        } catch (ExpiredJwtException e) {
            logger.warn("Expired JWT: {}", e);
            sendUnauthorized(response, "Token has expired");
            return;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT: {}", e);
            sendUnauthorized(response, "Invalid token");
            return;
        } catch (Exception e) {
            logger.warn("JWT validation failed: {}", e);
            sendUnauthorized(response, "Invalid token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(message)));
    }
}
