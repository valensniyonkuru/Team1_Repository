package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.ApiResponse;
import com.amalitech.communityboard.dto.CommentRequest;
import com.amalitech.communityboard.dto.CommentResponse;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getCommentsByPost(postId, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User author) {
        CommentResponse data = commentService.createComment(postId, request, author);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment created successfully", data));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User author) {
        commentService.deleteComment(postId, commentId, author);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully"));
    }
}
