package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.exception.ForbiddenException;
import com.amalitech.communityboard.exception.NotFoundException;
import com.amalitech.communityboard.exception.UnauthorizedException;
import com.amalitech.communityboard.model.*;
import com.amalitech.communityboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private static final int MAX_PAGE_SIZE = 50;

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPost(Long postId, int page, int size) {
        int safeSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by("createdAt").ascending());
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest request, User author) {
        if (author == null) {
            throw new UnauthorizedException("You must be logged in to comment");
        }
        if (!author.isEmailVerified()) {
            throw new ForbiddenException("You must verify your email before commenting");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent().trim())
                .post(post)
                .author(author)
                .build();
        return toResponse(commentRepository.save(comment));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or #author.id == principal.id ")
    public void deleteComment(Long postId, Long commentId, User author) {
        if (author == null) {
            throw new UnauthorizedException("You must be logged in to delete a comment");
        }
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        if (!comment.getPost().getId().equals(postId)) {
            throw new NotFoundException("Comment not found");
        }
        boolean isAuthor;
        try {
            isAuthor = comment.getAuthor().getId().equals(author.getId());
        } catch (EntityNotFoundException e) {
            isAuthor = false; 
        }
        boolean isAdmin = author.getRole().name().equals("ADMIN");
        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    private CommentResponse toResponse(Comment comment) {
        String authorName;
        try {
            authorName = (comment.getAuthor() == null || comment.getAuthor().getDeletedAt() != null)
                    ? "Unknown Author"
                    : comment.getAuthor().getName();
        } catch (EntityNotFoundException e) {
            authorName = "Unknown Author";
        }
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorName(authorName)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
