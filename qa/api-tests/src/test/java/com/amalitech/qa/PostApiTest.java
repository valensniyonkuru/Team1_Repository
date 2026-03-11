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

        // Verify the user email via JDBC so we can create posts
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection("jdbc:postgresql://localhost:5432/communityboard", "postgres", "dev_password_change_me");
             java.sql.PreparedStatement stmt = conn.prepareStatement("UPDATE users SET email_verified = true WHERE email = ?")) {
            stmt.setString(1, "posttester@test.com");
            stmt.executeUpdate();
        } catch (Exception e) {
            // If dev_password_change_me fails, try 'postgres' password (used in some CI environments)
            try (java.sql.Connection conn = java.sql.DriverManager.getConnection("jdbc:postgresql://localhost:5432/communityboard", "postgres", "postgres");
                 java.sql.PreparedStatement stmt = conn.prepareStatement("UPDATE users SET email_verified = true WHERE email = ?")) {
                stmt.setString(1, "posttester@test.com");
                stmt.executeUpdate();
            } catch (Exception ex) {
                System.err.println("Failed to verify user email via JDBC: " + ex.getMessage());
            }
        }

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
            .body("data.content", notNullValue());
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
            .statusCode(201)
            .body("data.title", equalTo("QA Test Post"));
    }

    // TODO: Add more post tests
    // - testUpdatePost
    // - testDeletePost
    // - testCreatePostUnauthorized
    // - testGetPostById
}
