package com.amalitech.qa.comments;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class CommentApiTest extends BaseApiTest {

    private int commentPostId;

    @BeforeClass
    public void createTestPost() {
        commentPostId = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + adminToken)
            .body("{\"title\":\"Comment Test Post\",\"content\":\"For comment tests\",\"category\":\"General\"}")
        .when().post("/api/posts")
        .then().statusCode(201).extract().path("id");
    }

    @Test(priority = 1)
    public void testGetCommentsForPost() {
        authGet("/api/posts/" + commentPostId + "/comments").statusCode(200).body("$", notNullValue());
    }

    @Test(priority = 2)
    public void testCreateComment() {
        authPost("/api/posts/" + commentPostId + "/comments", "{\"content\":\"QA automated comment\"}")
            .statusCode(201).body("content", equalTo("QA automated comment"));
    }

    @Test(priority = 3)
    public void testCreateCommentUnauthenticated() {
        given().contentType(ContentType.JSON).body("{\"content\":\"Should fail\"}")
        .when().post("/api/posts/" + commentPostId + "/comments")
        .then().statusCode(401);
    }

    @Test(priority = 4)
    public void testCreateEmptyComment() {
        authPost("/api/posts/" + commentPostId + "/comments", "{\"content\":\"\"}").statusCode(400);
    }

    @Test(priority = 5)
    public void testCommentResponseFields() {
        authPost("/api/posts/" + commentPostId + "/comments", "{\"content\":\"Field check\"}")
            .statusCode(201)
            .body("id",        notNullValue())
            .body("content",   notNullValue())
            .body("authorId",  notNullValue())
            .body("createdAt", notNullValue());
    }

    @Test(priority = 6)
    public void testDeleteComment() {
        int cid = authPost("/api/posts/" + commentPostId + "/comments", "{\"content\":\"Delete me\"}")
            .statusCode(201).extract().path("id");
        authDelete("/api/posts/" + commentPostId + "/comments/" + cid).statusCode(204);
    }

    @Test(priority = 7)
    public void testDeleteNonExistentComment() {
        authDelete("/api/posts/" + commentPostId + "/comments/99999").statusCode(404);
    }

    @Test(priority = 8)
    public void testGetCommentsNonExistentPost() {
        authGet("/api/posts/99999/comments").statusCode(404);
    }
}
