let encryptLib=require('cryptlib');
var constant={
    itemPerPage:3,
    itemPerPageForBanner:1,
    encryptionKey:encryptLib.getHashSha256("xza548sa3vcr641b5ng5nhy9mlo64r6k",32),
    encryptionIV:"5ng5nhy9mlo64r6k",
    base_url:"www.base_url.com",
    base:"http://localhost",
    app_url:"http://localhost:3315",
    app_name:"Home Kitchen",
    mailer_email:"rochakvyas2003@gmail.com",
    mailer_password:"dsck fhxo vhjh lwrt",
    from_email:"rochakvyas2003@gmail.com",
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
}
module.exports=constant;