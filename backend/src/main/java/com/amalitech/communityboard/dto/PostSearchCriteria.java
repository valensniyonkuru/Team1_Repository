package com.amalitech.communityboard.dto;

import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Pageable;


@Value
@Builder
public class PostSearchCriteria {
    String keyword;
    Long categoryId;
    Long authorId;
    Pageable pageable;
}
