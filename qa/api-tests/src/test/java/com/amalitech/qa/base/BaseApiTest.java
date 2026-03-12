package com.amalitech.qa.base;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import org.testng.annotations.BeforeSuite;

import java.util.List;
import java.util.stream.Collectors;

import static io.restassured.RestAssured.given;

public class BaseApiTest {

    // Backend running locally with QA DB
    // These can be overridden via environment variables:
    // QA_BASE_URI, QA_ADMIN_EMAIL, QA_ADMIN_PASS
    protected static final String BASE_URI =
            System.getenv().getOrDefault("QA_BASE_URI", "http://localhost:8080");
    protected static final String ADMIN_EMAIL =
            System.getenv().getOrDefault("QA_ADMIN_EMAIL", "admin@amalitech.com");
    protected static final String ADMIN_PASS =
            System.getenv().getOrDefault("QA_ADMIN_PASS", "QAAdmin@123");

    protected static String adminToken;

    @BeforeSuite
    public void globalSetup() {
        RestAssured.baseURI = BASE_URI;

        // Single login for the whole suite (avoids rate limit 429 from multiple logins).
        ValidatableResponse loginResponse = given()
                .contentType(ContentType.JSON)
                .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASS + "\"}")
                .when()
                .post("/api/auth/login")
                .then();

        int statusCode = loginResponse.extract().statusCode();

        // If rate limited (429), wait and retry once; then fall back to register if still failing
        if (statusCode == 429) {
            try { Thread.sleep(2000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            loginResponse = given()
                    .contentType(ContentType.JSON)
                    .body("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASS + "\"}")
                    .when()
                    .post("/api/auth/login")
                    .then();
            statusCode = loginResponse.extract().statusCode();
        }

        // If credentials fail or still rate limited, auto-register a fresh test user so suite can run
        if (statusCode == 401 || statusCode == 404 || statusCode == 429) {
            String email = uniqueEmail();
            String password = "Test@1234"; // strong password matching backend validation

            var registerRes = given()
                .contentType(ContentType.JSON)
                .body("{\"name\":\"API Test User\",\"email\":\"" + email + "\",\"password\":\"" + password + "\"}")
            .when()
                .post("/api/auth/register");
            int registerStatus = registerRes.getStatusCode();
            if (registerStatus != 201) {
                String body = registerRes.getBody().asString();
                throw new AssertionError("Register failed (expected 201, got " + registerStatus + "). Restart backend so AuthService/Redis/mail fixes are active. Response: " + (body.length() > 200 ? body.substring(0, 200) + "..." : body));
            }

            loginResponse = given()
                    .contentType(ContentType.JSON)
                    .body("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}")
                    .when()
                    .post("/api/auth/login")
                    .then()
                    .statusCode(200);
        } else {
            loginResponse.statusCode(200);
        }

        // Extract token from the standard ApiResponse<AuthResponse> shape (trim in case of whitespace)
        String raw = loginResponse.extract().path("data.accessToken");
        adminToken = raw == null ? null : raw.trim();

        if (adminToken == null || adminToken.isBlank()) {
            throw new AssertionError("Login did not return data.accessToken. Check backend response shape (expected ApiResponse with data.accessToken).");
        }

        // If no categories exist, try to create one (works when token is ADMIN so post tests can run)
        int catStatus = given().when().get("/api/categories").then().extract().statusCode();
        if (catStatus == 200) {
            List<?> categories = given().when().get("/api/categories").then().extract().path("");
            if (categories == null || categories.isEmpty()) {
                var createRes = authPost("/api/admin/categories", "{\"name\":\"General\",\"description\":\"General discussion\"}");
                if (createRes.extract().statusCode() == 201) {
                    System.out.println("Created default category (admin token).");
                }
            }
        }
    }

    protected ValidatableResponse login(String email, String password) {
        return given()
                .contentType(ContentType.JSON)
                .body("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}")
                .when()
                .post("/api/auth/login")
                .then();
    }

    protected String uniqueEmail() {
        return "qatester_" + System.currentTimeMillis() + "@test.com";
    }

    /** GET /api/categories returns a raw JSON array. Returns first category id. Requires at least one category (backend CategorySeeder or scripts/seed-categories.sql). */
    protected long getFirstCategoryId() {
        Object id = given().when().get("/api/categories").then().statusCode(200).extract().path("[0].id");
        if (id == null) {
            throw new IllegalStateException("No categories in DB. Start the backend so CategorySeeder runs, or run scripts/seed-categories.sql.");
        }
        return id instanceof Number ? ((Number) id).longValue() : Long.parseLong(id.toString());
    }

    /** Returns all category ids from GET /api/categories. Requires at least one category. */
    protected List<Long> getCategoryIds() {
        List<?> raw = given().when().get("/api/categories").then().statusCode(200).extract().path("id");
        if (raw == null || raw.isEmpty()) {
            throw new IllegalStateException("No categories in DB. Start the backend so CategorySeeder runs, or run scripts/seed-categories.sql.");
        }
        return raw.stream()
                .map(o -> o instanceof Number ? ((Number) o).longValue() : Long.parseLong(o.toString()))
                .collect(Collectors.toList());
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