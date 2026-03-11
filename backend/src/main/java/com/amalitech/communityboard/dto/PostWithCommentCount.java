package com.amalitech.communityboard.dto;

import com.amalitech.communityboard.model.Post;

public interface PostWithCommentCount {
    Post getPost();
    Long getCommentCount();
}
