package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.*;
import com.amalitech.communityboard.exception.ForbiddenException;
import com.amalitech.communityboard.exception.NotFoundException;
import com.amalitech.communityboard.exception.UnauthorizedException;
import com.amalitech.communityboard.model.*;
import com.amalitech.communityboard.repository.*;
import com.amalitech.communityboard.service.mapper.PostSearchMapper;
import com.amalitech.communityboard.specs.PostSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final int MAX_PAGE_SIZE = 50;

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final PostSearchMapper searchMapper;

    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(int page, int size) {
        int safeSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by("createdAt").descending());
        return postRepository.findAllWithCommentCount(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        return toResponse(post);
    }

    @Transactional
    public PostResponse createPost(PostRequest request, User author) {
        if (author == null) {
            throw new UnauthorizedException("You must be logged in to create a post");
        }
        if (!author.isEmailVerified()) {
            throw new ForbiddenException("You must verify your email before creating a post");
        }

        Category category = resolveCategory(request.getCategoryId());

        Post post = Post.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .author(author)
                .category(category)
                .build();
        return toResponse(postRepository.save(post));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or #author.id == principal.id ")
    public PostResponse updatePost(Long id, PostRequest request, User author) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        boolean isAuthor;
        try {
            isAuthor = post.getAuthor().getId().equals(author.getId());
        } catch (EntityNotFoundException e) {
            isAuthor = false; 
        }
        if (!isAuthor && !author.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("Not authorized to update this post");
        }
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setCategory(resolveCategory(request.getCategoryId()));
        return toResponse(postRepository.save(post));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or #author.id == principal.id ")
    public void deletePost(Long id, User author) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        boolean isAuthor;
        try {
            isAuthor = post.getAuthor().getId().equals(author.getId());
        } catch (EntityNotFoundException e) {
            isAuthor = false;
        }
        if (!isAuthor && !author.getRole().name().equals("ADMIN")) {
            throw new ForbiddenException("Not authorized to delete this post");
        }
        commentRepository.deleteByPostId(id);
        postRepository.delete(post);
    }


    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(PostSearchRequest request, int page, int size) {
        int safeSize = Math.min(size, MAX_PAGE_SIZE);
        PostSearchCriteria criteria = searchMapper.toCriteria(request, page, safeSize);
        Specification<Post> spec = PostSpecification.from(criteria);

        return postRepository.findAll(spec, criteria.getPageable())
                .map(this::toResponse);
    }

    private PostResponse toResponse(PostWithCommentCount projection) {
        Post post = projection.getPost();
        return buildResponse(post, projection.getCommentCount());
    }

    private PostResponse toResponse(Post post) {
        long commentCount = commentRepository.countByPostId(post.getId());
        return buildResponse(post, commentCount);
    }

    private PostResponse buildResponse(Post post, long commentCount) {
        String authorName;
        String authorEmail;
        try {
            if (post.getAuthor() == null || post.getAuthor().getDeletedAt() != null) {
                authorName = "Deleted User";
                authorEmail = null;
            } else {
                authorName = post.getAuthor().getName();
                authorEmail = post.getAuthor().getEmail();
            }
        } catch (EntityNotFoundException e) {
            authorName = "Unknown Author";
            authorEmail = null;
        }
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .authorName(authorName)
                .authorEmail(authorEmail)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(commentCount)
                .build();
    }
}
