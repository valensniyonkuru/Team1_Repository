package com.amalitech.qa.posts;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class PostCreateApiTest extends BaseApiTest {

    private String body(String title, String content, String category) {
        return "{\"title\":\"" + title + "\",\"content\":\"" + content + "\",\"category\":\"" + category + "\"}";
    }

    // TC-POST-001: Authenticated user creates post returns 201
    @Test(priority = 1)
    public void testCreatePostAuthenticated() {
        authPost("/api/posts", body("QA Test Post", "Automated test content", "General"))
            .statusCode(201)   // BUG raised to Peggy — currently returns 200
            .body("title", equalTo("QA Test Post"));
    }

    // TC-POST-002: Unauthenticated request returns 401
    @Test(priority = 2)
    public void testCreatePostUnauthenticated() {
        given().contentType(ContentType.JSON).body(body("Unauth Post", "Should fail", "General"))
        .when().post("/api/posts")
        .then().statusCode(401);
    }

    // TC-POST-003: Missing title returns 400
    @Test(priority = 3)
    public void testCreatePostMissingTitle() {
        authPost("/api/posts", "{\"content\":\"No title\",\"category\":\"General\"}").statusCode(400);
    }

    // TC-POST-004: Missing content returns 400
    @Test(priority = 4)
    public void testCreatePostMissingContent() {
        authPost("/api/posts", "{\"title\":\"No Content\",\"category\":\"General\"}").statusCode(400);
    }

    // TC-POST-005: Invalid category returns 400
    @Test(priority = 5)
    public void testCreatePostInvalidCategory() {
        authPost("/api/posts", body("Bad Cat", "Content", "InvalidCategory")).statusCode(400);
    }

    // TC-POST-006: All four valid categories accepted
    @Test(priority = 6)
    public void testCreatePostAllValidCategories() {
        for (String cat : new String[]{"General", "Events", "Tech", "Help"}) {
            authPost("/api/posts", body("Post in " + cat, "Content", cat)).statusCode(201);
        }
    }

    // TC-POST-007: Response contains required fields
    @Test(priority = 7)
    public void testCreatePostResponseFields() {
        authPost("/api/posts", body("Field Check", "Content", "Tech"))
            .statusCode(201)
            .body("id",       notNullValue())
            .body("title",    notNullValue())
            .body("category", notNullValue())
            .body("authorId", notNullValue());
    }
}
