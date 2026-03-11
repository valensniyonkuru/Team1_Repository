package com.amalitech.qa.tests.auth;

import com.amalitech.qa.base.BaseUITest;
import com.amalitech.qa.pages.LoginPage;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

// Kanban Card #24: [QA] Selenium: Login Page Test
public class LoginPageTest extends BaseUITest {

    private LoginPage loginPage;

    @BeforeMethod
    public void openLoginPage() {
        loginPage = new LoginPage(driver);
        loginPage.open();
    }

    // TC-UI-AUTH-001: Page loads with both inputs
    @Test(priority = 1)
    public void testLoginPageLoads() {
        wait.until(d -> d.getTitle().contains("CommunityBoard"));
        assertTrue(loginPage.isEmailInputPresent(),    "Email input should be visible");
        assertTrue(loginPage.isPasswordInputPresent(), "Password input should be visible");
    }

    // TC-UI-AUTH-002: Page title contains CommunityBoard
    @Test(priority = 2)
    public void testPageTitle() {
        assertTrue(driver.getTitle().contains("CommunityBoard"),
            "Got: " + driver.getTitle());
    }

    // TC-UI-AUTH-003: Wrong password shows error  (TODO: activate once Abraham adds data-testid)
    @Test(priority = 3)
    public void testWrongPasswordShowsError() {
        // loginPage.loginWith(ADMIN_EMAIL, "wrongpassword");
        // assertTrue(loginPage.isErrorDisplayed());
    }

    // TC-UI-AUTH-004: Successful login redirects to home  (TODO)
    @Test(priority = 4)
    public void testSuccessfulLoginRedirects() {
        // loginPage.loginWith(ADMIN_EMAIL, ADMIN_PASS);
        // wait.until(d -> d.getCurrentUrl().contains("/home"));
        // assertTrue(driver.getCurrentUrl().contains("/home"));
    }
}
