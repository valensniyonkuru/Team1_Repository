package com.amalitech.communityboard.repository;

import com.amalitech.communityboard.dto.PostWithCommentCount;
import com.amalitech.communityboard.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    @Query("""
    SELECT p AS post , COUNT(c.id) AS commentCount
    FROM Post p
    LEFT JOIN Comment c ON c.post.id = p.id
    GROUP BY p.id
    ORDER BY p.createdAt DESC
    """)

    Page<PostWithCommentCount> findAllWithCommentCount(Pageable pageable);


}
