package com.amalitech.communityboard.specs;

import com.amalitech.communityboard.dto.PostSearchCriteria;
import com.amalitech.communityboard.model.Post;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class PostSpecification {

    private PostSpecification() {}

    public static Specification<Post> from(PostSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            applyKeyword(criteria.getKeyword(), root, cb, predicates);
            applyCategoryFilter(criteria.getCategoryId(), root, predicates);
            applyAuthorFilter(criteria.getAuthorId(), root, predicates);
            optimizeFetches(root, query);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void applyKeyword(String keyword, Root<Post> root,
                                     CriteriaBuilder cb, List<Predicate> predicates) {
        if (!StringUtils.hasText(keyword)) return;

        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        predicates.add(cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("content")), pattern)
        ));
    }

    private static void applyCategoryFilter(Long categoryId, Root<Post> root,
                                            List<Predicate> predicates) {
        if (categoryId == null) return;
        predicates.add(root.get("category").get("id").in(categoryId));
    }

    private static void applyAuthorFilter(Long authorId, Root<Post> root,
                                          List<Predicate> predicates) {
        if (authorId == null) return;
        predicates.add(root.get("author").get("id").in(authorId));
    }


    private static void optimizeFetches(Root<Post> root, CriteriaQuery<?> query) {
        if (query.getResultType().equals(Long.class)) return;
        root.fetch("author", JoinType.LEFT);
        root.fetch("category", JoinType.LEFT);
    }
}