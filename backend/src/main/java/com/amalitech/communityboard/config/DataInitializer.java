package com.amalitech.communityboard.config;
 
 import com.amalitech.communityboard.model.Category;
 import com.amalitech.communityboard.model.User;
 import com.amalitech.communityboard.model.enums.Role;
 import com.amalitech.communityboard.repository.CategoryRepository;
 import com.amalitech.communityboard.repository.UserRepository;
 import lombok.RequiredArgsConstructor;
 import org.springframework.boot.CommandLineRunner;
 import org.springframework.security.crypto.password.PasswordEncoder;
 import org.springframework.stereotype.Component;
 
 @Component
 @RequiredArgsConstructor
 public class DataInitializer implements CommandLineRunner {
 
     private final UserRepository userRepository;
     private final CategoryRepository categoryRepository;
     private final PasswordEncoder passwordEncoder;
 
     @Override
     public void run(String... args) {
         // Initializing Categories if empty
         if (categoryRepository.count() == 0) {
             categoryRepository.save(Category.builder().name("NEWS").description("Neighborhood news").build());
             categoryRepository.save(Category.builder().name("EVENT").description("Local events").build());
             categoryRepository.save(Category.builder().name("DISCUSSION").description("Open discussions").build());
             categoryRepository.save(Category.builder().name("ALERT").description("Urgent alerts").build());
         }
 
         // Initializing Admin if missing
         if (userRepository.findByEmail("admin@amalitech.com").isEmpty()) {
             userRepository.save(User.builder()
                     .name("Admin User")
                     .email("admin@amalitech.com")
                     .password(passwordEncoder.encode("password123"))
                     .role(Role.ADMIN)
                     .build());
         }
     }
 }
