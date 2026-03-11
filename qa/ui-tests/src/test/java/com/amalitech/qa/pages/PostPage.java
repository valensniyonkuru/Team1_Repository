package com.amalitech.qa.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

// data-testid required: post-title-input, post-content-input, post-category-select,
// post-submit-button, post-title, post-content, post-category, post-edit-button,
// post-delete-button, comment-input, comment-submit-button, comment-list
public class PostPage {
    private final WebDriver driver;

    @FindBy(css = "[data-testid='post-title-input']")    private WebElement titleInput;
    @FindBy(css = "[data-testid='post-content-input']")  private WebElement contentInput;
    @FindBy(css = "[data-testid='post-category-select']") private WebElement categorySelect;
    @FindBy(css = "[data-testid='post-submit-button']")  private WebElement submitButton;
    @FindBy(css = "[data-testid='post-title']")          private WebElement postTitle;
    @FindBy(css = "[data-testid='post-content']")        private WebElement postContent;
    @FindBy(css = "[data-testid='post-category']")       private WebElement postCategory;
    @FindBy(css = "[data-testid='post-edit-button']")    private WebElement editButton;
    @FindBy(css = "[data-testid='post-delete-button']")  private WebElement deleteButton;
    @FindBy(css = "[data-testid='comment-input']")       private WebElement commentInput;
    @FindBy(css = "[data-testid='comment-submit-button']") private WebElement commentSubmit;
    @FindBy(css = "[data-testid='comment-list']")        private List<WebElement> commentList;

    public PostPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void createPost(String title, String content, String category) {
        titleInput.clear();   titleInput.sendKeys(title);
        contentInput.clear(); contentInput.sendKeys(content);
        new Select(categorySelect).selectByVisibleText(category);
        submitButton.click();
    }

    public String getPostTitle()    { return postTitle.getText();    }
    public String getPostContent()  { return postContent.getText();  }
    public String getPostCategory() { return postCategory.getText(); }

    public void clickEdit()   { editButton.click();   }
    public void clickDelete() { deleteButton.click(); }

    public void addComment(String text) {
        commentInput.clear();
        commentInput.sendKeys(text);
        commentSubmit.click();
    }

    public int getCommentCount() { return commentList.size(); }
}
