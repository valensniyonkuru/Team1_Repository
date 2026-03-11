package com.amalitech.qa.base;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import org.testng.annotations.BeforeSuite;

import static io.restassured.RestAssured.given;

public class BaseApiTest {

    protected static final String BASE_URI    = "http://localhost:8080";
    protected static final String ADMIN_EMAIL = "kotanov301@3dkai.com";
    protected static final String ADMIN_PASS  = "Admin@123";

    protected static String adminToken;

    @BeforeSuite
    public void globalSetup() {

        RestAssured.baseURI = BASE_URI;

        // login and extract token from correct JSON path
        adminToken = login(ADMIN_EMAIL, ADMIN_PASS)
                .extract()
                .path("data.accessToken");

        // debug to confirm token was obtained
        System.out.println("Admin token: " + adminToken);
    }

    protected ValidatableResponse login(String email, String password) {

        return given()
                .contentType(ContentType.JSON)
                .body("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}")
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200);
    }

    protected String uniqueEmail() {
        return "qatester_" + System.currentTimeMillis() + "@test.com";
    }

    protected ValidatableResponse authGet(String path) {

        return given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .get(path)
                .then();
    }

    protected ValidatableResponse authPost(String path, String body) {

        return given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + adminToken)
                .body(body)
                .when()
                .post(path)
                .then();
    }

    protected ValidatableResponse authPut(String path, String body) {

        return given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + adminToken)
                .body(body)
                .when()
                .put(path)
                .then();
    }

    protected ValidatableResponse authDelete(String path) {

        return given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .delete(path)
                .then();
    }
}