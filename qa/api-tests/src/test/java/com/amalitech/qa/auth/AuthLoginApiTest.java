package com.amalitech.qa.auth;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class AuthLoginApiTest extends BaseApiTest {

    // TC-AUTH-008: Valid credentials return 200 + token
    @Test(priority = 1)
    public void testLoginValidUser() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASS + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("token", notNullValue());
    }

    // TC-AUTH-009: Admin login returns role=ADMIN
    @Test(priority = 2)
    public void testAdminLoginReturnsAdminRole() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASS + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("role", equalTo("ADMIN"));
    }

    // TC-AUTH-010: Wrong password returns 401
    @Test(priority = 3)
    public void testLoginWrongPassword() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"wrongpassword\"}")
        .when().post("/api/auth/login")
        .then().statusCode(401);
    }

    // TC-AUTH-011: Non-existent email returns 401
    @Test(priority = 4)
    public void testLoginNonExistentEmail() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"nobody@nowhere.com\",\"password\":\"whatever\"}")
        .when().post("/api/auth/login")
        .then().statusCode(401);
    }

    // TC-AUTH-012: Missing email returns 400
    @Test(priority = 5)
    public void testLoginMissingEmail() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"password\":\"password123\"}")
        .when().post("/api/auth/login")
        .then().statusCode(400);
    }

    // TC-AUTH-013: Missing password returns 400
    @Test(priority = 6)
    public void testLoginMissingPassword() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + ADMIN_EMAIL + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(400);
    }

    // TC-AUTH-014: JWT token is non-empty string
    @Test(priority = 7)
    public void testJwtTokenIsNonEmpty() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASS + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("token", not(emptyString()));
    }
}
