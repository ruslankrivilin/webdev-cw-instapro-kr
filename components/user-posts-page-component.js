import { USER_POSTS_PAGE, LOADING_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, formatDate, renderApp, setPosts } from "../index.js";
import { likeApi, dislikeApi, getUserPosts } from "../api.js";

export function renderUserPostsPageComponent({ appEl }) {

  const appPosts = posts.map((post) => {
    return {
      userImageUrl: post.user.imageUrl,
      userName: post.user.name,
      userId: post.user.id,
      imageUrl: post.imageUrl,
      description: post.description,
      userLogin: post.user.login,
      date: formatDate(post.createdAt),
      likes: post.likes,
      isLiked: post.isLiked,
      id: post.id,
    }
  })

  const postsHtml = appPosts.map((element, index) => {
    return `
        <div class="page-container">
          <div class="header-container"></div>
          <ul class="posts">
            <li class="post" data-index=${index}>
              <div class="post-header" data-user-id="${element.userId}">
                  <img src="${element.userImageUrl}" class="post-header__user-image">
                  <p class="post-header__user-name">${element.userName}</p>
              </div>
              <div class="post-image-container">
                <img class="post-image" src="${element.imageUrl}">
              </div>
              <div class="post-likes">
                <button data-post-id="${element.id}" data-like="${element.isLiked ? 'true' : ''}" data-index="${index}" class="like-button">
                  <img src="${element.isLiked ? `./assets/images/like-active.svg` : `./assets/images/like-not-active.svg`}">
                </button>
                <p class="post-likes-text">
                Нравится: <strong>${element.likes.length >= 1 ? element.likes[0].name : '0'}</strong> ${(element.likes.length - 1) > 0 ? 'и ещё' + ' ' + (element.likes.length - 1) + ' ' + 'человека': ''}
                </p>
              </div>
              <p class="post-text">
                <span class="user-name">${element.userName}</span>
                ${element.description}
              </p>
              <p class="post-date">
              ${element.date} назад
              </p>
            </li>                  
          </ul>
        </div>`
  });

  appEl.innerHTML = postsHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  const likeEventListener = () => {
    const likeButtons = document.querySelectorAll(".like-button");

    likeButtons.forEach(likeButton => {
      likeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const postId = likeButton.dataset.postId;
        const index = likeButton.dataset.index;
        const postHeader = document.querySelector('.post-header');
        const userId = postHeader.dataset.userId;
        likeButton.classList.add("shake-bottom");

        if (posts[index].isLiked) {
          dislikeApi({ token: getToken(), postId })
            .then(() => {
              posts[index].isLiked = false;
            })
            .then(() => {
              getUserPosts({ token: getToken(), userId })
                .then((response) => {
                  setPosts(response);
                  likeButton.classList.remove("shake-bottom");
                  renderApp();
                })
            })
        } else {
          likeApi({ token: getToken(), postId })
            .then(() => {
              posts[index].isLiked = true;
            })
            .then(() => {
              getUserPosts({ token: getToken(), userId })
                .then((response) => {
                  setPosts(response);
                  likeButton.classList.remove("shake-bottom");
                  renderApp();
                })
            })
        }
      });
    });
  };

  likeEventListener();
}