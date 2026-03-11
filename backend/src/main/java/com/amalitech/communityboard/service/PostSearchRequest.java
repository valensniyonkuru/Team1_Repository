package com.amalitech.communityboard.service;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PostSearchRequest {
    String keyword;
    Long categoryId;
    Long authorId;
    SortField sortBy;
    SortDirection direction;

    public enum SortField {
        CREATED_AT, UPDATED_AT, TITLE;

        public String toEntityField() {
            return switch (this) {
                case CREATED_AT -> "createdAt";
                case UPDATED_AT -> "updatedAt";
                case TITLE -> "title";
            };
        }
    }

    public enum SortDirection {
        ASC, DESC
    }
}
