package com.amalitech.qa.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

// data-testid required: name-input, email-input, password-input, register-button, register-error-message, login-link
public class RegisterPage {
    private final WebDriver driver;

    @FindBy(css = "[data-testid='name-input']")             private WebElement nameInput;
    @FindBy(css = "[data-testid='email-input']")            private WebElement emailInput;
    @FindBy(css = "[data-testid='password-input']")         private WebElement passwordInput;
    @FindBy(css = "[data-testid='register-button']")        private WebElement registerButton;
    @FindBy(css = "[data-testid='register-error-message']") private WebElement errorMessage;

    public RegisterPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void open() { driver.get("http://localhost:3000/register"); }

    public void register(String name, String email, String password) {
        nameInput.clear();     nameInput.sendKeys(name);
        emailInput.clear();    emailInput.sendKeys(email);
        passwordInput.clear(); passwordInput.sendKeys(password);
        registerButton.click();
    }

    public boolean isErrorDisplayed() {
        try { return errorMessage.isDisplayed(); } catch (Exception e) { return false; }
    }

    public String getErrorText() { return errorMessage.getText(); }
}
