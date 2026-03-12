package com.amalitech.qa;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.annotations.*;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class AuthApiTest {

    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "http://localhost:8080";
    }

    private static String registeredEmail;

    @Test(priority = 1)
    public void testRegisterNewUser() {
        registeredEmail = "qa_" + System.currentTimeMillis() + "@test.com";
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"QA Tester\",\"email\":\"" + registeredEmail + "\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("data.accessToken", notNullValue())
            .body("data.email", equalTo(registeredEmail));
    }

    @Test(priority = 2)
    public void testLoginExistingUser() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"" + registeredEmail + "\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("data.accessToken", notNullValue())
            .body("data.role", equalTo("USER"));
    }

    @Test(priority = 3)
    public void testLoginInvalidCredentials() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"email\":\"wrong@test.com\",\"password\":\"wrong\"}")
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(anyOf(is(401), is(500)));
    }

    // TODO: Add more auth tests
    // - testRegisterDuplicateEmail
    // - testRegisterInvalidEmail
    // - testAccessProtectedEndpoint
}
