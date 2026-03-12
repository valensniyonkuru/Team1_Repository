package com.amalitech.qa.auth;

import com.amalitech.qa.base.BaseApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

// Kanban Card #19: [QA] API Tests: User Registration
public class AuthRegisterApiTest extends BaseApiTest {

    // TC-AUTH-001: Successful registration returns 201
    @Test(priority = 1)
    public void testRegisterNewUser() {
        String email = uniqueEmail();

        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"QA Tester\",\"email\":\"" + email + "\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("data.accessToken", notNullValue())
            .body("data.email", equalTo(email));
    }

    // TC-AUTH-002: Duplicate email returns 409
    @Test(priority = 2)
    public void testRegisterDuplicateEmail() {
        String email = uniqueEmail();
        String body = "{\"name\":\"QA Tester\",\"email\":\"" + email + "\",\"password\":\"Test@1234\"}";
        given().contentType(ContentType.JSON).body(body).when().post("/api/auth/register").then().statusCode(201);
        given().contentType(ContentType.JSON).body(body).when().post("/api/auth/register").then().statusCode(409);
    }

    // TC-AUTH-003: Missing required fields returns 400
    @Test(priority = 3)
    public void testRegisterMissingFields() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"QA Tester\",\"email\":\"" + uniqueEmail() + "\"}")
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(400);
    }

    // TC-AUTH-004: Password is NOT returned in response
    @Test(priority = 4)
    public void testPasswordNotReturnedInResponse() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"QA Tester\",\"email\":\"" + uniqueEmail() + "\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("data.password", nullValue());
    }

    // TC-AUTH-005: userId and email returned on success
    @Test(priority = 5)
    public void testUserIdAndEmailReturnedOnSuccess() {
        String email = uniqueEmail();
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"QA Tester\",\"email\":\"" + email + "\",\"password\":\"Test@1234\"}")
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("data.email", equalTo(email))
            .body("data.accessToken", notNullValue());
    }

    // TODO: TC-AUTH-006 testRegisterInvalidEmailFormat  -> expect 400
    // TODO: TC-AUTH-007 testRegisterPasswordTooShort    -> expect 400
}
