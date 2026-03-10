package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.service.PostSearchRequest;
import com.amalitech.communityboard.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(postService.getAllPosts(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPostById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User author) {
        PostResponse data = postService.createPost(request, author);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            @AuthenticationPrincipal User author) {
        return ResponseEntity.ok(ApiResponse.success(postService.updatePost(id, request, author)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User author) {
        postService.deletePost(id, author);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(defaultValue = "CREATED_AT") PostSearchRequest.SortField sortBy,
            @RequestParam(defaultValue = "DESC") PostSearchRequest.SortDirection direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PostSearchRequest request = PostSearchRequest.builder()
                .keyword(keyword)
                .categoryId(categoryId)
                .authorId(authorId)
                .sortBy(sortBy)
                .direction(direction)
                .build();

        return ResponseEntity.ok(ApiResponse.success(postService.searchPosts(request, page, size)));
    }
}
