package com.amalitech.communityboard.dto;

import com.amalitech.communityboard.validation.ValidCategoryId;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PostRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Content is required")
    private String content;
    @ValidCategoryId
    private Long categoryId;
}
