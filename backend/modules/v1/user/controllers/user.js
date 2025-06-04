let userModel = require("../models/user-model");
let common = require("../../../../utilities/common");
let responseCode = require("../../../../utilities/response-error-code");
const Validator = require('Validator');
var middleware = require('../../../../middleware/validators');
const { t } = require('localizify');
const conn = require("../../../../config/database");
class user {
    async signup(req, res) {
        console.log("controller")
        req.body = middleware.decryption(req.body);
        var request = req.body;
       
        var rules = {
            login_type: 'required|in:simple,google,facebook'
        }

        if (request.login_type === 'simple') {
            Object.assign(rules, {
                name: 'required',
                email: 'required|email',
                password: 'required|min:6',
                // address: 'required',
                // latitude: 'required',
                // longitude: 'required',
                // profile_image: 'required',
                // language:'required'
            });
        } else {
            Object.assign(rules, {
                email:'required',
                social_id: 'required',
                // address: 'required',
                // latitude: 'required',
                // longitude: 'required',
                // language:'required'
            });
        }

        var rulesMessage = {
            required: req.language.required,
            email: req.language.email,
            in: req.language.in,
            min: req.language.min
        }
        var keywords = {
            'password': t('rest_keywords_password')
        }
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage, keywords);
        if (!isValid) {
            return;
        }

        const { code, message, data } = await userModel.signup(req.body);

        return middleware.send_response(req, res, code, message, data);

    }  
    
    async login(req, res) {

        req.body = middleware.decryption(req.body);
        var request = req.body;
        
    
        var rules = {
            // login_type: 'required|in:simple,google,facebook'
        };
    
        if (request.login_type === 'simple') {
            Object.assign(rules, {
                email: 'email',
                password: 'required|min:6',
                // latitude: 'required',
                // longitude: 'required'
            })
        } else {
            Object.assign(rules, {
                email:'required',
                // social_id: 'required'
            })
        }
    
        var rulesMessage = {
            required: req.language.required,
            email: req.language.email,
            in: req.language.in,
            min: req.language.min
        };
    
        var keywords = {
            'password': t('rest_keywords_password'),
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage, keywords);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.login(req);
       
        return middleware.send_response(req, res, code, message, data);
    }

    async getUserClubs(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getUserClubs(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async allClubs(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.allClubs(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async joinClub(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.joinClub(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async leaveClub(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.leaveClub(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async allBooks(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.allBooks(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async updateBookProgress(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.updateBookProgress(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async getAllBooks(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getAllBooks(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async getUserProfile(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getUserProfile(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async getDiscussions(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getDiscussions(req);
        return middleware.send_response(req, res, code, message, data);

    }


    async createDiscussion(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.createDiscussion(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async addReplyToDiscussion(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.addReplyToDiscussion(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async likeDiscussionReply(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.likeDiscussionReply(req);
        return middleware.send_response(req, res, code, message, data);
    }







    async getUserOrders(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getUserOrders(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async allProducts(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.allProducts(request);
        return middleware.send_response(req, res, code, message, data);
    }

    async addItemToCart(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.addItemToCart(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async addItemToWishlist(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.addItemToWishlist(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async removeCartItem(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.removeCartItem(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async increaseCartItem(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.increaseCartItem(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async decreaseCartItem(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.decreaseCartItem(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async removeWishlistItem(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.removeWishlistItem(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async getCartItems(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getCartItems(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async getCartCount(req, res) {
        console.log(req.body);
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // title: 'required',
            // description:'required',
            // image:'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await userModel.getCartCount(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async getUserWishlist(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await userModel.getUserWishlist(req);
        return middleware.send_response(req, res, code, message, data);
    }

}
module.exports = new user();