package com.amalitech.qa.tests.posts;

import com.amalitech.qa.base.BaseUITest;
import com.amalitech.qa.pages.PostPage;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class ViewEditDeletePostTest extends BaseUITest {

    private PostPage postPage;

    @BeforeClass
    public void login() {
        loginAsAdmin();
        postPage = new PostPage(driver);
    }

    // TC-UI-POST-010: Click post opens detail view  (TODO)
    @Test(priority = 1)
    public void testClickPostOpensDetail() { }

    // TC-UI-POST-011: Detail shows required fields  (TODO)
    @Test(priority = 2)
    public void testPostDetailShowsFields() { }

    // TC-UI-POST-012: Author can edit their post  (TODO)
    @Test(priority = 3)
    public void testEditPost() { }

    // TC-UI-POST-014: Author can delete their post  (TODO)
    @Test(priority = 4)
    public void testDeletePost() { }
}
