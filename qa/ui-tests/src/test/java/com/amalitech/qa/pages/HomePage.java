package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import java.util.List;

// data-testid required: post-list, post-card, search-input, search-button, create-post-button, category-{name}
public class HomePage {
    private final WebDriver driver;

    @FindBy(css = "[data-testid='post-card']")         private List<WebElement> postCards;
    @FindBy(css = "[data-testid='search-input']")      private WebElement searchInput;
    @FindBy(css = "[data-testid='search-button']")     private WebElement searchButton;
    @FindBy(css = "[data-testid='create-post-button']") private WebElement createPostButton;

    public HomePage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public int getPostCount() { return postCards.size(); }

    public void search(String keyword) {
        searchInput.clear();
        searchInput.sendKeys(keyword);
        searchButton.click();
    }

    public void clickCategoryFilter(String category) {
        driver.findElement(By.cssSelector("[data-testid='category-" + category + "']")).click();
    }

    public void clickCreatePost() { createPostButton.click(); }
}
