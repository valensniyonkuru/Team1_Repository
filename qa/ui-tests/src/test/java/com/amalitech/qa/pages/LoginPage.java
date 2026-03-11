package com.amalitech.qa.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

// data-testid required from Abraham: email-input, password-input, login-button, login-error-message, register-link
public class LoginPage {
    private final WebDriver driver;

    @FindBy(css = "[data-testid='email-input']")    private WebElement emailInput;
    @FindBy(css = "[data-testid='password-input']") private WebElement passwordInput;
    @FindBy(css = "[data-testid='login-button']")   private WebElement loginButton;
    @FindBy(css = "[data-testid='login-error-message']") private WebElement errorMessage;
    @FindBy(css = "[data-testid='register-link']")  private WebElement registerLink;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void open() { driver.get("http://localhost:3000/login"); }

    public void loginWith(String email, String password) {
        emailInput.clear();    emailInput.sendKeys(email);
        passwordInput.clear(); passwordInput.sendKeys(password);
        loginButton.click();
    }

    public boolean isErrorDisplayed() {
        try { return errorMessage.isDisplayed(); } catch (Exception e) { return false; }
    }

    public String getErrorText() { return errorMessage.getText(); }

    public boolean isEmailInputPresent() {
        try { return emailInput.isDisplayed(); } catch (Exception e) { return false; }
    }

    public boolean isPasswordInputPresent() {
        try { return passwordInput.isDisplayed(); } catch (Exception e) { return false; }
    }
}