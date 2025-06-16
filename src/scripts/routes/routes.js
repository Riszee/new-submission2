import HomePage from '../pages/home/home-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import DetailPage from '../pages/detail/detail-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import AboutPage from '../pages/about/about-page';
import BookmarkPage from '../pages/bookmarks/page-bookmark';

const routes = {
  '/': new HomePage(),
  '/bookmarks': new BookmarkPage(),
  '/add-story': new AddStoryPage(),
  '/stories/:id': new DetailPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/about': new AboutPage(),
};

export default routes;