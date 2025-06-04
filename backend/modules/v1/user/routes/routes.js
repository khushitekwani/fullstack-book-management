var user=require("../controllers/user");

var customRoute=(app)=>{
    app.post("/v1/user/signup",user.signup);
    app.post("/v1/user/login",user.login);
    app.post("/v1/user/user-details",user.getUserProfile);
    app.post("/v1/user/user-orders",user.getUserOrders);
    app.post("/v1/user/all-products",user.allProducts);
    app.post("/v1/user/add-item-to-cart",user.addItemToCart);
    app.post("/v1/user/add-item-to-wishlist",user.addItemToWishlist);
    app.post("/v1/user/remove-cart-item",user.removeCartItem);
    app.post("/v1/user/increase-cart-item",user.increaseCartItem);
    app.post("/v1/user/decrease-cart-item",user.decreaseCartItem);
    app.post("/v1/user/remove-wishlist-item",user.removeWishlistItem);
    app.post("/v1/user/user-wishlist",user.getUserWishlist);
    app.post("/v1/user/cart-count",user.getCartCount);
    app.post("/v1/user/cart",user.getCartItems);

    app.post("/v1/user/my-clubs",user.getUserClubs);
    app.post("/v1/user/all-clubs",user.allClubs);
    app.post("/v1/user/join-club",user.joinClub);
    app.post("/v1/user/leave-club",user.leaveClub);

    app.post("/v1/user/all-books",user.allBooks);
    app.post("/v1/user/update-book-progress",user.updateBookProgress);

    app.post("/v1/user/get-all-books",user.getAllBooks);


    app.post("/v1/user/get-discussions",user.getDiscussions);
    app.post("/v1/user/create-discussion",user.createDiscussion);
    app.post("/v1/user/add-comment",user.addReplyToDiscussion);
    app.post("/v1/user/like-reply",user.likeDiscussionReply);
 
}
module.exports=customRoute;