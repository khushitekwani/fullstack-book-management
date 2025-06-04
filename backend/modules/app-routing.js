class routing{
    v1(app){
        
        var user=require("./v1/user/routes/routes");
        var admin=require("./v1/admin/routes/routes");
    
        user(app);
        admin(app);
    
    }
}

module.exports=new routing();