var admin=require("../../admin/controllers/admin");

var customRoute=(app)=>{
    app.post("/v1/admin/signup",admin.signup);
    app.post("/v1/admin/login",admin.login);

    app.post("/v1/admin/all-books",admin.allBooks);
    app.post("/v1/admin/add-book",admin.addBook);
    app.post("/v1/admin/delete-book",admin.deleteBook);
    app.post("/v1/admin/update-book",admin.updateBook);
    app.post("/v1/admin/book-details",admin.getBookById);
    app.post("/v1/admin/genres",admin.genres);

    app.post("/v1/admin/all-users",admin.allUsers);
    app.post("/v1/admin/all-discussions",admin.allDiscussions);
    app.post("/v1/admin/discussion-details",admin.discussionDetails);
    app.post("/v1/admin/change-user-role",admin.changeUserRole);
    app.post("/v1/admin/delete-user",admin.deleteUser);
    app.post("/v1/admin/user-stats",admin.userStats);

    app.post("/v1/admin/club-members-listing",admin.clubMemberListing);
    app.post("/v1/admin/approve-member",admin.approveClubMember);
    app.post("/v1/admin/remove-member",admin.removeClubMember);



    app.post("/v1/admin/category",admin.categoryList);
    app.post("/v1/admin/all-products",admin.allProducts);
    app.post("/v1/admin/add-product",admin.addProduct);
    app.post("/v1/admin/delete-product",admin.deleteProduct);
    app.post("/v1/admin/update-product",admin.updateProduct);
    app.post("/v1/admin/product-details",admin.productDetails);
    app.post("/v1/admin/user-details",admin.userDetails);
    app.post("/v1/admin/block-user",admin.blockUser);
    app.post("/v1/admin/unblock-user",admin.unblockUser);
    app.post("/v1/admin/delete-user",admin.deleteUser);
    app.post("/v1/admin/user-listing",admin.userListing);

    app.post("/v1/admin/order-listing",admin.orderListing);
    app.post("/v1/admin/order-details",admin.orderDetails);
    app.post("/v1/admin/change-order-status",admin.changeOrderStatus);

}
module.exports=customRoute;