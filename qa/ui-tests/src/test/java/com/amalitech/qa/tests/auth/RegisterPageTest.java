package com.amalitech.qa.tests.auth;

import com.amalitech.qa.base.BaseUITest;
import com.amalitech.qa.pages.RegisterPage;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

public class RegisterPageTest extends BaseUITest {

    private RegisterPage registerPage;

    @BeforeMethod
    public void openRegisterPage() {
        registerPage = new RegisterPage(driver);
        registerPage.open();
    }

    @Test(priority = 1)
    public void testRegisterPageLoads() {
        assertTrue(driver.getCurrentUrl().contains("/register"));
    }

    // TC-UI-REG-002: Successful registration redirects  (TODO)
    @Test(priority = 2)
    public void testSuccessfulRegistration() {
        // String email = "uitester_" + System.currentTimeMillis() + "@test.com";
        // registerPage.register("UI Tester", email, "test1234");
        // wait.until(d -> d.getCurrentUrl().contains("/home") || d.getCurrentUrl().contains("/login"));
    }

    // TC-UI-REG-003: Duplicate email shows error  (TODO)
    @Test(priority = 3)
    public void testDuplicateEmailShowsError() {
        // registerPage.register("Dup", ADMIN_EMAIL, "test1234");
        // assertTrue(registerPage.isErrorDisplayed());
    }
}
