let adminModel = require("../models/admin-model");
let common = require("../../../../utilities/common");
let responseCode = require("../../../../utilities/response-error-code");
const Validator = require('Validator');
var middleware = require('../../../../middleware/validators');
const { t } = require('localizify');
const conn = require("../../../../config/database");
class admin {
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

        const { code, message, data } = await adminModel.signup(req.body);

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
    
        const { code, message, data } = await adminModel.login(req);
       
        return middleware.send_response(req, res, code, message, data);
    }

    async logout(req, res) {
       
        req.body = middleware.decryption(req.body);
        var request = req.body;
    
        var rules = {
            // device_token: 'required'
        };
    
        var rulesMessage = {
            required: req.language.required
        };
    
        const isValid = await middleware.checkValidationRules(req, res, request, rules, rulesMessage);
        if (!isValid) {
            return;
        }
    
        const { code, message, data } = await adminModel.logout(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async allBooks(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.allBooks(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async addBook(req, res) {
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
    
        const { code, message, data } = await adminModel.addBook(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async  getBookById(req, res) {
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
    
        const { code, message, data } = await adminModel.getBookById(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async updateBook(req, res) {
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
    
        const { code, message, data } = await adminModel.updateBook(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async deleteBook(req, res) {
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
    
        const { code, message, data } = await adminModel.deleteBook(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async genres(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.genres(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async allUsers(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.allUsers(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async allDiscussions(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.allDiscussions(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async discussionDetails(req, res) {
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
    
        const { code, message, data } = await adminModel.discussionDetails(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async changeUserRole(req, res) {
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
    
        const { code, message, data } = await adminModel.changeUserRole(req);
    
        return middleware.send_response(req, res, code, message, data);
    }
    
    async deleteUser(req, res) {
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
    
        const { code, message, data } = await adminModel.deleteUser(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async userStats(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.userStats(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async clubMemberListing(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.clubMemberListing(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async approveClubMember(req, res) {
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
    
        const { code, message, data } = await adminModel.approveClubMember(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async removeClubMember(req, res) {
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
    
        const { code, message, data } = await adminModel.removeClubMember(req);
    
        return middleware.send_response(req, res, code, message, data);
    }



























    async categoryList(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.categoryList(request);
        return middleware.send_response(req, res, code, message, data);
    }

    async allProducts(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.allProducts(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async addProduct(req, res) {
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
    
        const { code, message, data } = await adminModel.addProduct(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async productDetails(req, res) {
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
    
        const { code, message, data } = await adminModel.productDetails(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async updateProduct(req, res) {
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
    
        const { code, message, data } = await adminModel.updateProduct(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async deleteProduct(req, res) {
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
    
        const { code, message, data } = await adminModel.deleteProduct(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async userDetails(req, res) {
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
    
        const { code, message, data } = await adminModel.userDetails(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async deleteUser(req, res) {
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
    
        const { code, message, data } = await adminModel.deleteUser(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async blockUser(req, res) {
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
    
        const { code, message, data } = await adminModel.blockUser(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async unblockUser(req, res) {
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
    
        const { code, message, data } = await adminModel.unblockUser(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async userListing(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.userListing(request);
        return middleware.send_response(req, res, code, message, data);
    }
    
    async orderListing(req, res) {
        console.log("controller");
        req.body = middleware.decryption(req.body);
        var request = req.body;
        const { code, message, data } = await adminModel.orderListing(req);
        return middleware.send_response(req, res, code, message, data);
    }

    async orderDetails(req, res) {
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
    
        const { code, message, data } = await adminModel.orderDetails(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

    async changeOrderStatus(req, res) {
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
    
        const { code, message, data } = await adminModel.changeOrderStatus(req);
    
        return middleware.send_response(req, res, code, message, data);
    }

}
module.exports = new admin();