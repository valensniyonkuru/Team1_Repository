package com.amalitech.qa.auth;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Login API tests. Uses a freshly registered user so they pass regardless of
 * whether admin@amalitech.com exists or has a known password in the DB.
 */
public class AuthLoginApiTest extends BaseApiTest {

    private static final String TEST_PASSWORD = "Test@1234";

    // TC-AUTH-008: Valid credentials return 200 + token (register then login)
    @Test(priority = 1)
    public void testLoginValidUser() {
        String email = uniqueEmail();
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"Login Tester\",\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/register")
        .then().statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("data.accessToken", notNullValue());
    }

    // TC-AUTH-009: Login response includes role (USER for newly registered)
    @Test(priority = 2)
    public void testLoginReturnsRole() {
        String email = uniqueEmail();
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"Role Tester\",\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/register")
        .then().statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("data.role", notNullValue()).body("data.role", not(emptyString()));
    }

    // TC-AUTH-010: Wrong password returns 401
    @Test(priority = 3)
    public void testLoginWrongPassword() {
        String email = uniqueEmail();
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"Wrong Pass\",\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/register")
        .then().statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + email + "\",\"password\":\"wrongpassword\"}")
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
            .body("{\"email\":\"" + uniqueEmail() + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(400);
    }

    // TC-AUTH-014: JWT token is non-empty string
    @Test(priority = 7)
    public void testJwtTokenIsNonEmpty() {
        String email = uniqueEmail();
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"Token Tester\",\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/register")
        .then().statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + email + "\",\"password\":\"" + TEST_PASSWORD + "\"}")
        .when().post("/api/auth/login")
        .then().statusCode(200).body("data.accessToken", not(emptyString()));
    }
}
