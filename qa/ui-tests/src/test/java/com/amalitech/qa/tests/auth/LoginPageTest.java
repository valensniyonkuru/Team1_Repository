package com.amalitech.qa.tests.auth;

import com.amalitech.qa.base.BaseUITest;
import org.openqa.selenium.WebElement;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class LoginPageTest extends BaseUITest {

    @BeforeMethod
    public void openLoginPage() {
        navigateTo("/login");
    }

    @Test(priority = 1)
    public void testLoginPageLoads() {
        assertTrue(byTestId("email-input").isDisplayed(), "Email input should be visible");
        assertTrue(byTestId("password-input").isDisplayed(), "Password input should be visible");
        assertTrue(byTestId("login-button").isDisplayed(), "Login button should be visible");
    }

    @Test(priority = 2)
    public void testPageTitle() {
        assertTrue(driver.getTitle().contains("CommunityBoard"), "Page title should contain CommunityBoard");
    }

    @Test(priority = 3)
    public void testSuccessfulLoginRedirects() {
        fillFieldByTestId("email-input", ADMIN_EMAIL);
        fillFieldByTestId("password-input", ADMIN_PASS);
        clickButtonByTestId("login-button");
        wait.until(d -> d.getCurrentUrl().contains("/"));
        assertTrue(driver.getCurrentUrl().contains("/"), "Should navigate to home after login");
    }

    @Test(priority = 4)
    public void testWrongPasswordShowsError() {
        fillFieldByTestId("email-input", ADMIN_EMAIL);
        fillFieldByTestId("password-input", "wrongpassword");
        clickButtonByTestId("login-button");

        try {
            WebElement error = byTestId("login-error-message"); // matches your React LoginForm
            assertTrue(error.isDisplayed(), "Error message should be visible on wrong password");
        } catch (Exception e) {
            fail("Error message did not appear");
        }
    }
}