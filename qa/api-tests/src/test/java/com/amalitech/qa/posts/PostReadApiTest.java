package com.amalitech.qa.posts;

import com.amalitech.qa.base.BaseApiTest;
import org.testng.annotations.Test;

import static org.hamcrest.Matchers.*;

// Seed data: General=15, Events=14, Help=15, Tech=16, Total=60
public class PostReadApiTest extends BaseApiTest {

    @Test(priority = 1)
    public void testGetAllPosts() {
        authGet("/api/posts").statusCode(200).body("content", notNullValue());
    }

    @Test(priority = 2)
    public void testGetAllPostsPaginated() {
        authGet("/api/posts")
            .statusCode(200)
            .body("totalElements", notNullValue())
            .body("totalPages",    notNullValue());
    }

    @Test(priority = 3)
    public void testGetPostById() {
        authGet("/api/posts/1").statusCode(200).body("id", equalTo(1));
    }

    @Test(priority = 4)
    public void testGetPostByInvalidId() {
        authGet("/api/posts/99999").statusCode(404);
    }

    @Test(priority = 5)
    public void testFilterByGeneral() {
        authGet("/api/posts?category=General").statusCode(200).body("totalElements", equalTo(15));
    }

    @Test(priority = 6)
    public void testFilterByEvents() {
        authGet("/api/posts?category=Events").statusCode(200).body("totalElements", equalTo(14));
    }

    @Test(priority = 7)
    public void testFilterByHelp() {
        authGet("/api/posts?category=Help").statusCode(200).body("totalElements", equalTo(15));
    }

    @Test(priority = 8)
    public void testFilterByTech() {
        authGet("/api/posts?category=Tech").statusCode(200).body("totalElements", equalTo(16));
    }
}
