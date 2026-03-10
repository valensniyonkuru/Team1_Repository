package com.amalitech.communityboard.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthTokenStore {

    private final StringRedisTemplate redisTemplate;

    private static final String VERIFY_PREFIX = "auth:verify:";
    private static final String RESET_PREFIX = "auth:reset:";
    private static final int VERIFY_TTL_MINUTES = 30;
    private static final int RESET_TTL_MINUTES = 20;

    public void storeEmailVerificationToken(String token, String email) {
        redisTemplate.opsForValue().set(
                VERIFY_PREFIX + token,
                email,
                VERIFY_TTL_MINUTES,
                TimeUnit.MINUTES
        );
    }

    public Optional<String> getAndDeleteEmailVerificationToken(String token) {
        String key = VERIFY_PREFIX + token;
        String email = redisTemplate.opsForValue().get(key);
        if (email != null) {
            redisTemplate.delete(key);
            return Optional.of(email);
        }
        return Optional.empty();
    }

    public void storePasswordResetToken(String token, String email) {
        redisTemplate.opsForValue().set(
                RESET_PREFIX + token,
                email,
                RESET_TTL_MINUTES,
                TimeUnit.MINUTES
        );
    }

    public Optional<String> getAndDeletePasswordResetToken(String token) {
        String key = RESET_PREFIX + token;
        String email = redisTemplate.opsForValue().get(key);
        if (email != null) {
            redisTemplate.delete(key);
            return Optional.of(email);
        }
        return Optional.empty();
    }
}
