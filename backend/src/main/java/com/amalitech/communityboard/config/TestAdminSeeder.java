package com.amalitech.communityboard.config;

import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.model.enums.AuthProvider;
import com.amalitech.communityboard.model.enums.Role;
import com.amalitech.communityboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * When "test" profile is active, ensures an admin user exists so API tests can use QA_ADMIN_EMAIL / QA_ADMIN_PASS.
 */
@Component
@Profile("test")
@Order(0)
@RequiredArgsConstructor
@Slf4j
public class TestAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@amalitech.com";
    private static final String ADMIN_PASS = "QAAdmin@123";
    private static final String ADMIN_NAME = "QA Admin";

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(ADMIN_EMAIL)) {
            return;
        }
        User admin = User.builder()
                .email(ADMIN_EMAIL)
                .name(ADMIN_NAME)
                .password(passwordEncoder.encode(ADMIN_PASS))
                .role(Role.ADMIN)
                .authProvider(AuthProvider.MANUAL)
                .emailVerified(true)
                .build();
        userRepository.save(admin);
        log.info("Seeded test admin user {}", ADMIN_EMAIL);
    }
}
