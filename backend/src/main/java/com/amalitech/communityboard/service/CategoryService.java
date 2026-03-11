package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.CategoryRequest;
import com.amalitech.communityboard.dto.CategoryResponse;
import com.amalitech.communityboard.exception.ConflictException;
import com.amalitech.communityboard.exception.NotFoundException;
import com.amalitech.communityboard.model.Category;
import com.amalitech.communityboard.repository.CategoryRepository;
import com.amalitech.communityboard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.findByName(name).isPresent()) {
            throw new ConflictException("A category with this name already exists");
        }
        Category category = Category.builder()
                .name(name)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        String name = request.getName().trim();
        categoryRepository.findByName(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ConflictException("A category with this name already exists");
                });
        category.setName(name);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        if (postRepository.existsByCategory_Id(id)) {
            throw new ConflictException("Cannot delete category that is in use by posts");
        }
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
