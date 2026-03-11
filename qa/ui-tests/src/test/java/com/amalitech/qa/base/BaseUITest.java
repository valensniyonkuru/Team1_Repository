package com.amalitech.qa.base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.time.Duration;

public class BaseUITest {

    protected static final String BASE_URL    = "http://localhost:3000";
    protected static final String ADMIN_EMAIL = "admin@amalitech.com";
    protected static final String ADMIN_PASS  = "password123";

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeClass
    public void setupDriver() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1920,1080");
        driver = new ChromeDriver(options);
        wait   = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterClass
    public void teardownDriver() {
        if (driver != null) driver.quit();
    }

    protected void navigateTo(String path) {
        driver.get(BASE_URL + path);
    }

    protected WebElement byTestId(String testId) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[data-testid='" + testId + "']")));
    }

    protected void fillField(String testId, String value) {
        WebElement el = byTestId(testId);
        el.clear();
        el.sendKeys(value);
    }

    protected void clickButton(String testId) {
        byTestId(testId).click();
    }

    protected void loginAsAdmin() {
        navigateTo("/login");
        fillField("email-input",    ADMIN_EMAIL);
        fillField("password-input", ADMIN_PASS);
        clickButton("login-button");
        wait.until(ExpectedConditions.urlContains("/home"));
    }
}
