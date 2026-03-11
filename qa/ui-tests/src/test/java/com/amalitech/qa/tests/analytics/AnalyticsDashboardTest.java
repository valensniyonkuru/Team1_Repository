package com.amalitech.qa.tests.analytics;

import com.amalitech.qa.base.BaseUITest;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

public class AnalyticsDashboardTest extends BaseUITest {

    @BeforeClass
    public void login() { loginAsAdmin(); }

    // TC-UI-ANAL-001: Admin can navigate to analytics page
    @Test(priority = 1)
    public void testAdminCanOpenAnalytics() {
        navigateTo("/analytics");
        assertTrue(driver.getCurrentUrl().contains("analytics"));
    }

    // TC-UI-ANAL-002 to 006 — activate once Abraham adds data-testid attributes
    @Test(priority = 2)
    public void testTotalPostCountDisplayed() { }

    @Test(priority = 3)
    public void testCategoryChartVisible() { }

    @Test(priority = 4)
    public void testTotalUserCountDisplayed() { }

    @Test(priority = 5)
    public void testTotalCommentCountDisplayed() { }
}
