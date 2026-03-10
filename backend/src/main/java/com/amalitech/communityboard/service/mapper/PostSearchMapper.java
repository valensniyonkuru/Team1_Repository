package com.amalitech.communityboard.service.mapper;

import com.amalitech.communityboard.dto.PostSearchCriteria;
import com.amalitech.communityboard.service.PostSearchRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PostSearchMapper {
    public PostSearchCriteria toCriteria(PostSearchRequest request, int page, int size) {
        Sort sort = buildSort(request);
        Pageable pageable = PageRequest.of(page, size, sort);

        return PostSearchCriteria.builder()
                .keyword(request.getKeyword())
                .categoryId(request.getCategoryId())
                .authorId(request.getAuthorId())
                .pageable(pageable)
                .build();
    }

    private Sort buildSort(PostSearchRequest request) {
        if (request.getSortBy() == null) {
            return Sort.by("createdAt").descending();
        }

        String field = request.getSortBy().toEntityField();
        return request.getDirection() == PostSearchRequest.SortDirection.ASC
                ? Sort.by(field).ascending()
                : Sort.by(field).descending();
    }

}
