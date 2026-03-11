package com.amalitech.qa.search;

import com.amalitech.qa.base.BaseApiTest;
import org.testng.annotations.Test;

import static org.hamcrest.Matchers.*;

public class SearchFilterApiTest extends BaseApiTest {

    @Test(priority = 1)
    public void testSearchByKeyword() {
        authGet("/api/posts?search=community").statusCode(200).body("content.size()", greaterThan(0));
    }

    @Test(priority = 2)
    public void testSearchNoResults() {
        authGet("/api/posts?search=zzznomatch999xyz").statusCode(200).body("content.size()", equalTo(0));
    }

    @Test(priority = 3)
    public void testFilterGeneral() {
        authGet("/api/posts?category=General").statusCode(200).body("totalElements", equalTo(15));
    }

    @Test(priority = 4)
    public void testFilterEvents() {
        authGet("/api/posts?category=Events").statusCode(200).body("totalElements", equalTo(14));
    }

    @Test(priority = 5)
    public void testFilterHelp() {
        authGet("/api/posts?category=Help").statusCode(200).body("totalElements", equalTo(15));
    }

    @Test(priority = 6)
    public void testFilterTech() {
        authGet("/api/posts?category=Tech").statusCode(200).body("totalElements", equalTo(16));
    }

    @Test(priority = 7)
    public void testSearchWithCategoryFilter() {
        authGet("/api/posts?search=test&category=Tech").statusCode(200).body("content", notNullValue());
    }

    @Test(priority = 8)
    public void testSearchCaseInsensitive() {
        int lower = authGet("/api/posts?search=community").statusCode(200).extract().path("totalElements");
        int upper = authGet("/api/posts?search=COMMUNITY").statusCode(200).extract().path("totalElements");
        org.testng.Assert.assertEquals(lower, upper, "Search should be case-insensitive");
    }

    @Test(priority = 9)
    public void testEmptySearchReturnsAll() {
        authGet("/api/posts?search=").statusCode(200).body("totalElements", equalTo(60));
    }
}
