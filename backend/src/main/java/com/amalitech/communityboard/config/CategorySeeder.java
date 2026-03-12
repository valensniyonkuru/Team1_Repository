package com.amalitech.communityboard.config;

import com.amalitech.communityboard.model.Category;
import com.amalitech.communityboard.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds default categories on startup when the table is empty so API tests and the app can create posts without manual DB setup.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class CategorySeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    private static final List<Category> DEFAULTS = List.of(
            Category.builder().name("General").description("General discussion").build(),
            Category.builder().name("Events").description("Community events").build(),
            Category.builder().name("Help").description("Help and support").build(),
            Category.builder().name("Tech").description("Technology").build()
    );

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        for (Category c : DEFAULTS) {
            if (categoryRepository.findByName(c.getName()).isEmpty()) {
                categoryRepository.save(c);
            }
        }
        log.info("Seeded {} default categories", DEFAULTS.size());
    }
}
