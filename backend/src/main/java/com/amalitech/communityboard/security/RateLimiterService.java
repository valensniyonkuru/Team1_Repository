package com.amalitech.communityboard.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class RateLimiterService {

    private final ConcurrentHashMap<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    private static final int MAX_ATTEMPTS = 10;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    public boolean tryConsume(String key) {
        Deque<Instant> timestamps = attempts.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();
        Instant cutoff = now.minus(WINDOW);

        while (!timestamps.isEmpty() && timestamps.peekFirst() != null && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_ATTEMPTS) {
            return false;
        }

        timestamps.addLast(now);
        return true;
    }

    @Scheduled(fixedRate = 60000)
    public void cleanup() {
        Instant cutoff = Instant.now().minus(WINDOW);
        attempts.forEach((key, timestamps) -> {
            while (!timestamps.isEmpty() && timestamps.peekFirst() != null && timestamps.peekFirst().isBefore(cutoff)) {
                timestamps.pollFirst();
            }
            if (timestamps.isEmpty()) {
                attempts.remove(key);
            }
        });
    }
}
