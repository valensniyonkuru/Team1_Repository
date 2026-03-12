package com.amalitech.communityboard;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * One-off: run with "mvn test -Dtest=PasswordHashGenerator" to print BCrypt hash for QA admin password.
 */
class PasswordHashGenerator {

    @Test
    void printHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("QAAdmin@123");
        System.out.println("BCrypt hash for QAAdmin@123:");
        System.out.println(hash);
    }
}
