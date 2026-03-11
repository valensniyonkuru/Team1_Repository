package com.amalitech.qa.posts;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class PostUpdateDeleteApiTest extends BaseApiTest {

    private int testPostId;

    @BeforeClass
    public void createTestPost() {
        testPostId = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + adminToken)
            .body("{\"title\":\"Update-Delete Test\",\"content\":\"For tests\",\"category\":\"General\"}")
        .when().post("/api/posts")
        .then().statusCode(201).extract().path("id");
    }

    @Test(priority = 1)
    public void testUpdatePost() {
        authPut("/api/posts/" + testPostId, "{\"title\":\"Updated Title\",\"content\":\"Updated\",\"category\":\"Tech\"}")
            .statusCode(200).body("title", equalTo("Updated Title"));
    }

    @Test(priority = 2)
    public void testUpdatePostMissingTitle() {
        authPut("/api/posts/" + testPostId, "{\"content\":\"No title\",\"category\":\"General\"}").statusCode(400);
    }

    @Test(priority = 3)
    public void testUpdateNonExistentPost() {
        authPut("/api/posts/99999", "{\"title\":\"Ghost\",\"content\":\"Nope\",\"category\":\"General\"}").statusCode(404);
    }

    @Test(priority = 4)
    public void testDeletePost() {
        int id = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + adminToken)
            .body("{\"title\":\"To Delete\",\"content\":\"Bye\",\"category\":\"Help\"}")
        .when().post("/api/posts")
        .then().statusCode(201).extract().path("id");
        authDelete("/api/posts/" + id).statusCode(204);
    }

    @Test(priority = 5)
    public void testDeleteNonExistentPost() {
        authDelete("/api/posts/99999").statusCode(404);
    }

    @Test(priority = 6)
    public void testDeletePostUnauthenticated() {
        given().when().delete("/api/posts/" + testPostId).then().statusCode(401);
    }

    @Test(priority = 7)
    public void testDeletedPostNotRetrievable() {
        int id = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + adminToken)
            .body("{\"title\":\"Temp\",\"content\":\"Gone\",\"category\":\"Events\"}")
        .when().post("/api/posts")
        .then().statusCode(201).extract().path("id");
        authDelete("/api/posts/" + id).statusCode(204);
        authGet("/api/posts/" + id).statusCode(404);
    }
}
