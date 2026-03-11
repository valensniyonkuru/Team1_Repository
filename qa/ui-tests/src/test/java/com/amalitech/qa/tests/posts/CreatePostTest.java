package com.amalitech.qa.tests.posts;

import com.amalitech.qa.base.BaseUITest;
import com.amalitech.qa.pages.PostPage;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class CreatePostTest extends BaseUITest {

    private PostPage postPage;

    @BeforeClass
    public void login() {
        loginAsAdmin();
        postPage = new PostPage(driver);
    }

    // TC-UI-POST-001: Open create post form  (TODO: activate once Abraham adds data-testid)
    @Test(priority = 1)
    public void testOpenCreatePostForm() {
        // homePage.clickCreatePost();
        // assertTrue(driver.getCurrentUrl().contains("/posts/new"));
    }

    // TC-UI-POST-002: Valid form creates post  (TODO)
    @Test(priority = 2)
    public void testCreatePostSuccess() {
        // postPage.createPost("UI Post", "Selenium content", "General");
        // assertEquals(postPage.getPostTitle(), "UI Post");
    }

    // TC-UI-POST-003: Missing title shows error  (TODO)
    @Test(priority = 3)
    public void testCreatePostMissingTitle() {
        // submit without title
        // assertTrue(postPage.isFormErrorDisplayed());
    }
}
