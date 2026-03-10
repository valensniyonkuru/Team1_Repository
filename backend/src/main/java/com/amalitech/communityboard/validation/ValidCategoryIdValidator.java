package com.amalitech.communityboard.validation;

import com.amalitech.communityboard.repository.CategoryRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ValidCategoryIdValidator implements ConstraintValidator<ValidCategoryId, Long> {

    private final CategoryRepository categoryRepository;

    @Override
    public boolean isValid(Long value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return categoryRepository.existsById(value);
    }
}
