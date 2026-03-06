package com.amalitech.qa;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class LoginPageTest {

    private WebDriver driver;

    @BeforeClass
    public void setup() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
    }

    @Test
    public void testLoginPageLoads() {
        driver.get("http://localhost:3000/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.titleContains("CommunityBoard"));
        
        assertTrue(driver.getTitle().contains("CommunityBoard"));
        assertNotNull(driver.findElement(By.cssSelector("input[type=\"email\"]")));
        assertNotNull(driver.findElement(By.cssSelector("input[type=\"password\"]")));
    }

    // TODO: Add more UI tests
    // - testSuccessfulLogin
    // - testNavigationAfterLogin
    // - testCreatePostFlow
    // - testRegisterFlow

    @AfterClass
    public void teardown() {
        if (driver != null) driver.quit();
    }
}
