package com.amalitech.qa.analytics;

import com.amalitech.qa.base.BaseApiTest;
import org.testng.annotations.Test;

import static org.hamcrest.Matchers.*;

// Confirm exact endpoint path and response field names with Peggy
public class AnalyticsApiTest extends BaseApiTest {

    private static final String PATH = "/api/analytics";

    @Test(priority = 1)
    public void testAdminAccessAnalytics() {
        authGet(PATH).statusCode(200);
    }

    @Test(priority = 2)
    public void testAnalyticsUnauthenticated() {
        io.restassured.RestAssured.when().get(PATH).then().statusCode(401);
    }

    @Test(priority = 3)
    public void testTotalPostCount() {
        authGet(PATH).statusCode(200).body("totalPosts", equalTo(60));
    }

    @Test(priority = 4)
    public void testCategoryBreakdown() {
        authGet(PATH).statusCode(200)
            .body("categories.General", equalTo(15))
            .body("categories.Events",  equalTo(14))
            .body("categories.Help",    equalTo(15))
            .body("categories.Tech",    equalTo(16));
    }

    @Test(priority = 5)
    public void testTotalUserCount() {
        authGet(PATH).statusCode(200).body("totalUsers", equalTo(25));
    }

    @Test(priority = 6)
    public void testTotalCommentCount() {
        authGet(PATH).statusCode(200).body("totalComments", equalTo(240));
    }
}
