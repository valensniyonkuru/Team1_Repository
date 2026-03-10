package com.amalitech.qa;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.annotations.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class PostApiTest {

    private String authToken;

    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "http://localhost:8080";

        // Register a user just for this test
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"Post Tester\",\"email\":\"posttester@test.com\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/register");

        // Login to get token
        var response = given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"posttester@test.com\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .extract();
            
        authToken = response.path("data.accessToken");
    }

    @Test
    public void testGetAllPosts() {
        given()
        .when()
            .get("/api/posts")
        .then()
            .statusCode(200)
            .body("content", notNullValue());
    }

    @Test
    public void testCreatePost() {
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + authToken)
            .body("{\"title\":\"QA Test Post\",\"content\":\"Automated test content\",\"categoryId\":1}")
        .when()
            .post("/api/posts")
        .then()
            .statusCode(200)
            .body("title", equalTo("QA Test Post"));
    }

    // TODO: Add more post tests
    // - testUpdatePost
    // - testDeletePost
    // - testCreatePostUnauthorized
    // - testGetPostById
}
