package com.amalitech.qa.tests.search;

import com.amalitech.qa.base.BaseUITest;
import com.amalitech.qa.pages.HomePage;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class SearchFilterUITest extends BaseUITest {

    private HomePage homePage;

    @BeforeClass
    public void login() {
        loginAsAdmin();
        homePage = new HomePage(driver);
        navigateTo("/");
    }

    // TC-UI-SRCH-001 to 009 — activate once Abraham adds data-testid attributes
    @Test(priority = 1)
    public void testSearchBarVisible() { }

    @Test(priority = 2)
    public void testSearchFiltersResults() { }

    @Test(priority = 3)
    public void testSearchNoResultsMessage() { }

    @Test(priority = 4)
    public void testFilterByGeneral() { }

    @Test(priority = 5)
    public void testFilterByEvents() { }

    @Test(priority = 6)
    public void testFilterByTech() { }

    @Test(priority = 7)
    public void testFilterByHelp() { }
}
