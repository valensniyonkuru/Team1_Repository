package com.amalitech.qa.base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.io.File;
import java.io.IOException;
import java.time.Duration;

public class BaseUITest {

    protected static final String BASE_URL    = "http://localhost:3000";
    // Use the same seeded admin the backend and API tests use
    protected static final String ADMIN_EMAIL = "admin@amalitech.com";
    protected static final String ADMIN_PASS  = "QAAdmin@123";

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeClass
    public void setupDriver() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        // Run in a CI-friendly headless mode; flags also work locally.
        options.addArguments(
                "--headless=new",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080"
        );
        driver = new ChromeDriver(options);
        wait   = new WebDriverWait(driver, Duration.ofSeconds(25)); // increase wait for slow React
    }

    @AfterClass
    public void teardownDriver() {
        if (driver != null) driver.quit();
    }

    protected void navigateTo(String path) {
        driver.get(BASE_URL + path);
        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
    }

    protected WebElement byTestId(String testId) {
        try {
            WebElement el = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("[data-testid='" + testId + "']")));
            return wait.until(ExpectedConditions.visibilityOf(el));
        } catch (TimeoutException e) {
            takeScreenshot("element-" + testId + "-not-found.png");
            throw new RuntimeException("Element with data-testid='" + testId + "' not found or not visible after wait", e);
        }
    }

    protected void fillFieldByTestId(String testId, String value) {
        WebElement el = byTestId(testId);
        el.clear();
        el.sendKeys(value);
    }

    protected void clickButtonByTestId(String testId) {
        byTestId(testId).click();
    }

    protected void loginAsAdmin() {
        navigateTo("/login");

        int retries = 3;
        long waitBetweenRetries = 500; // milliseconds

        for (int attempt = 1; attempt <= retries; attempt++) {
            try {
                fillFieldByTestId("email-input", ADMIN_EMAIL);
                fillFieldByTestId("password-input", ADMIN_PASS);
                clickButtonByTestId("login-button");

                // wait for redirect to home/dashboard
                wait.until(ExpectedConditions.urlMatches(BASE_URL + "(/|/dashboard|/analytics)?"));
                return; // login successful
            } catch (Exception e) {
                System.out.println("Login attempt " + attempt + " failed: " + e.getMessage());
                takeScreenshot("login-fail-attempt-" + attempt + ".png");

                try { Thread.sleep(waitBetweenRetries); } catch (InterruptedException ignored) {}
                waitBetweenRetries *= 2; // exponential backoff
            }
        }

        throw new RuntimeException("Failed to login as admin after " + retries + " retries");
    }

    private void takeScreenshot(String fileName) {
        try {
            File src = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(src, new File(System.getProperty("user.dir") + "/screenshots/" + fileName));
            System.out.println("Screenshot saved: " + fileName);
        } catch (IOException ioException) {
            System.err.println("Failed to take screenshot: " + ioException.getMessage());
        }
    }
}