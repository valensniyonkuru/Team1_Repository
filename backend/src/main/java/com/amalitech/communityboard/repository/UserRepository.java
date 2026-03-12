package com.amalitech.communityboard.repository;

import com.amalitech.communityboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    boolean existsByRole(com.amalitech.communityboard.model.enums.Role role);

    Optional<User> findByIdAndDeletedAtIsNull(Long id);
}
