// const Validator = require('Validator');
// const { default: localizify } = require('localizify');
// var en = require("../languages/en");
// var ar = require("../languages/ar");
// var hi = require("../languages/hi");
// require('dotenv').config();
// const { t } = require('localizify');
// let conn = require("../config/database");
// // let crypto = require('crypto');
// // var shaKey = crypto.getHashSha256(process.env.KEY, 32)

// const crypto = require('crypto');
// // // const helper = require('./helper');
// const key = Buffer.from(process.env.KEY, 'utf8');
// // // const iv = Buffer.from(process.env.IV, 'base64');
// const iv = Buffer.from(process.env.IV, 'utf8');
// // const key = crypto.randomBytes(process.env.KEY); 
// // const iv = crypto.randomBytes(process.env.IV);  

// // const shaKey = crypto.createHash('sha256').update(process.env.KEY).digest('base64').slice(0, 32);

// var bypassMethods = new Array("statusChange", "resetUsingMail", "login", "signup", "verify", "forgotPassword", "resendOTP", "resetPassword", "findNearestDriver");
// var middleware = {

//     checkValidationRules: async function (req, res, request, rules, message, keywords) {
//         console.log("check valid");
//         const v = Validator.make(request, rules, message, keywords);
//         if (v.fails()) {

//             const errors = v.getErrors();
//             var error = "";
//             for (key in errors) {
//                 error = errors[key][0];

//                 break;
//             }
//             request_data = {
//                 code: "0",
//                 message: error
//             }
//             const encryptedResponse = await middleware.encryption(request_data)
//             res.status(200);
//             res.send(encryptedResponse);

//             return false;
//         } else {

//             return true;
//         }
//     },
//     send_response: async function (req, res, code, message, data) {


//         const translated_message = await this.getMessage(req.lang, message);

//         if (data == null) {
//             response_data = {
//                 code: code,
//                 message: translated_message,
//                 data: data
//             }
//             const encryptedResponse = await middleware.encryption(response_data)
//             res.status(200).send(encryptedResponse);
//         } else {
//             response_data = {
//                 code: code,
//                 message: translated_message,
//                 data: data
//             }

//             const encryptedResponse = await middleware.encryption(response_data)
//             res.status(200).send(encryptedResponse);
//         }

//     },
//     getMessage: function (language, message) {
//         console.log("getMessage input:", message);
//         localizify
//             .add('en', en)
//             .add('ar', ar)
//             .add('hi', hi)
//             .setLocale(language);
//         let translatedMessage = t(message.keyword);

//         if (message.content) {
//             Object.keys(message.content).forEach(key => {
//                 translatedMessage = translatedMessage.replace(`{ ${key} }`, message.content[key])
//             })
//         }
//         // callback(t(message.keyword,message.content));
//         // callback(translatedMessage);
//         return (translatedMessage);
//     },
//     extractHeaderLanguage: function (req, res, callback) {
//         console.log("check valid 2");
//         var headerlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "")
//             ? req.headers['accept-language'] : 'en';
//         req.lang = headerlang;

//         req.language = (headerlang == 'en') ? en : (headerlang == 'ar') ? ar : hi;

//         localizify
//             .add('en', en)
//             .add('ar', ar)
//             .add('hi', hi)
//             .setLocale(req.lang);
//         callback();
//     },
//     // decryption: function (encrypted_text) {
//     //     if (encrypted_text != undefined && Object.keys(encrypted_text).length !== 0) {
//     //         try {
//     //             //console.log(shaKey);
//     //             var request = JSON.parse(crypto.decrypt(encrypted_text, shaKey, process.env.IV));

//     //             return (request)
//     //             // callback(encrypted_text)
//     //         } catch (error) {
//     //             return ({});
//     //         }
//     //     } else {
//     //         return ({});
//     //     }
//     // },

//     // encryption: function (response_data) {
//     //     var response = crypto.encrypt(JSON.stringify(response_data), shaKey, process.env.IV);
//     //     //callback(response);
//     //     return (response);
//     // },

//     helper: async function name(params) {
//         isJson: (str) => {
//             try {
//                 JSON.parse(str);
//                 return true;
//             } catch (e) {
//                 return false;
//             }
//         }
//     }
//     ,

//     encryption: async function (requestData) {
//         try {
//             if (!requestData) return null;
//             const data = typeof requestData === 'object' ? JSON.stringify(requestData) : requestData;
//             const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
//             let encrypted = cipher.update(data, 'utf8', 'base64');
//             encrypted += cipher.final('base64');
//             return encrypted;
//         } catch (error) {
//             console.error('Encryption error:', error);
//             return error;
//         }
//     },

//     decryption: async function (requestData) {
//         console.log(requestData);
//         try {
//             if (!requestData) return {};
//             const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
//             let decrypted = decipher.update(requestData, 'base64', 'utf8');
//             decrypted += decipher.final('utf8');

//             console.log(decrypted);
//             return helper.isJson(decrypted) === true ? JSON.parse(decrypted) : decrypted;

//         } catch (error) {
//             return requestData;
//         }
//     },


    // validateApiKey: async function (req, res, callback) {
    //     var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != "") ? req.headers['api-key'] : '';
    //     if (api_key != "") {
    //         try {
    //             const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    //             let decrypted = decipher.update(api_key, 'base64', 'utf8');
    //             decrypted += decipher.final('utf8');
    //             if (decrypted != "" && decrypted == process.env.API_KEY) {
    //                 console.log("api key is set")
    //                 callback();
    //             } else {
    //                 response_data = {
    //                     code: '0',
    //                     message: "Invalid API Key"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } catch (error) {
    //             response_data = {
    //                 code: '0',
    //                 message: "Invalid API Key"
    //             }
    //             const encryptedResponse = await middleware.encryption(response_data)
    //             return res.status(401).send(encryptedResponse);
    //         }
    //     } else {
    //         response_data = {
    //             code: '0',
    //             message: "Invalid API Key"
    //         }
    //         const encryptedResponse = await middleware.encryption(response_data)
    //         return res.status(401).send(encryptedResponse);
    //     }

    // },

    // validateHeaderToken: async function (req, res, callback) {
    //     var headertoken = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';
    //     var path_data = req.path.split("/");
    //     console.log(headertoken)
    //     console.log(bypassMethods.indexOf(path_data[3]) === -1)
    //     console.log(path_data[2] == "admin")
    //     if (path_data[2] == "admin") {

    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 console.log("===token")
    //                 try {
    //                     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    //                     let dec_token = decipher.update(headertoken, 'base64', 'utf8');
    //                     dec_token += decipher.final('utf8');
    //                     console.log(dec_token)
    //                     if (dec_token != "") {
    //                         console.log("Token is set")
    //                         const [result] = await conn.query("select * from tbl_admin where admin_token=?", [dec_token])
    //                         if (!error && result.length > 0) {
    //                             req.admin_id = result[0].id;
    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }

    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     } else if (path_data[2] == "driver") {
    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 try {
    //                     var dec_token = crypto.decrypt(headertoken, shaKey, process.env.IV);
    //                     console.log(dec_token)
    //                     if (dec_token != "") {
    //                         const [result] = await conn.query("select tbl_driver_device.* from tbl_driver_device join tbl_driver on tbl_driver.id=tbl_driver_device.driver_id where tbl_driver_device.user_token=? and tbl_driver.is_active=1 and tbl_driver.is_deleted=0", [dec_token])

    //                         if (result.length > 0) {
    //                             req.user_id = result[0].driver_id;

    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }
    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     } else {
    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 try {
    //                     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    //                     let dec_token = decipher.update(headertoken, 'base64', 'utf8');
    //                     dec_token += decipher.final('utf8');
    //                     if (dec_token != "") {
    //                         console.log(dec_token)
    //                         const [result] = await conn.query("select tbl_user_device.* from tbl_user_device join tbl_user on tbl_user.id=tbl_user_device.user_id where tbl_user_device.user_token=? and tbl_user.is_active=1 and tbl_user.is_deleted=0", [dec_token])
    //                         if (result.length > 0) {
    //                             req.user_id = result[0].user_id;
    //                             console.log("token is set")
    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }
    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     }
    // },

// };

// module.exports = middleware;


// const Validator = require('Validator');
// const { default: localizify } = require('localizify');
// var en = require("../languages/en");
// var ar = require("../languages/ar");
// var hi = require("../languages/hi");
// let common = require('../utilities/common');
// const { t } = require('localizify');
// let conn = require("../config/database");
// const crypto=require('crypto')
// require('dotenv').config();
// let iv=process.env.IV 
// let hash_key=process.env.KEY 
// var middleware = {

//     checkValidationRules:async function (req, res, request, rules, message, keywords) {
     
//         const v = Validator.make(request, rules, message, keywords);
//         if (v.fails()) {

//             const errors = v.getErrors();
//             var error = "";
//             for (key in errors) {
//                 error = errors[key][0];
//                 break;
//             }
//             request_data = {
//                 code: "0",
//                 message: error,
//             }
//             const encryptedResponse = middleware.encryption(request_data)
//             res.status(200);
//             res.send(encryptedResponse);
//             console.log("enc res",encryptedResponse)
//             return false;
//         } else {
//             return true;
//         }
//     },
//     send_response: async function (req, res, code, message, data) {
        
        
//         const translated_message = await this.getMessage(req.lang, message);

//         if (data == null) {
//             response_data = {
//                 code: code,
//                 message: translated_message,
//                 data: data
//             }
//             const encryptedResponse =await middleware.encryption(response_data)
//             res.status(200).send(encryptedResponse);
//         } else {
//             response_data = {
//                 code: code,
//                 message: translated_message,
//                 data: data
//             }
            
//             const encryptedResponse =await middleware.encryption(response_data)
//             res.status(200).send(encryptedResponse);
//         }

//     },

//     getMessage: function (language, message) {
//         console.log("getMessage input:", message);
//         localizify
//             .add('en', en)
//             .add('ar', ar)
//             .add('hi', hi)
//             .setLocale(language);
//         let translatedMessage = t(message.keyword);

//         if (message.content) {
//             Object.keys(message.content).forEach(key => {
//                 translatedMessage = translatedMessage.replace(`{ ${key} }`, message.content[key])
//             })
//         }
//         // callback(t(message.keyword,message.content));
//         // callback(translatedMessage);
//         return (translatedMessage);
//     },
//     decryption(requestedData){
//         try {
//             if (!requestedData) return {}
//             const decipher = crypto.createDecipheriv('aes-256-cbc',hash_key,iv);
//             let decrypted = decipher.update(requestedData, 'base64', 'utf-8');
//             decrypted += decipher.final('utf-8');
//             return (this.checkJson(decrypted)) ? JSON.parse(decrypted): decrypted
//         } catch (error) {
//             console.error("Encruption Error",error)
//             return error;
//         }
//     },
//     checkJson(data){
//         try {
//             JSON.parse(data);
//         } catch (e) {
//             return false;
//         } 
//         return true
//     },
//     encryption(requestedData){
//         try {
//             console.log(hash_key);
//             if (!requestedData) return null;
//             const data = typeof requestedData === "object" ? JSON.stringify(requestedData) : requestedData;
//             const cipher = crypto.createCipheriv('aes-256-cbc',hash_key,iv)
//             let encrypted = cipher.update(data,'utf-8','base64')
//             encrypted += cipher.final('base64')
//             return encrypted
//         } catch (error) {
//             console.error("Encruption Error",error)
//             return error;
//         }
//     },
//     extractHeaderLanguage: function (req, res, callback) {
//         console.log("check valid");
//         var headerlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "")
//             ? req.headers['accept-language'] : 'en';
//         req.lang = headerlang;

//         req.language = (headerlang == 'en') ? en : (headerlang == 'ar') ? ar : hi;

//         localizify
//             .add('en', en)
//             .add('ar', ar)
//             .add('hi', hi)
//             .setLocale(req.lang);
//         callback();
//     }

// };

// module.exports = middleware;

const Validator = require('Validator');
const { default: localizify, t } = require('localizify');
const en = require("../languages/en");
const ar = require("../languages/ar");
const hi = require("../languages/hi");
require('dotenv').config();
const crypto = require('crypto');
const conn = require("../config/database");

// Security improvement: Generate a secure key and IV or retrieve from secure storage
const key = Buffer.from(process.env.KEY || '', 'hex'); // Use hex encoding for better security
const iv = Buffer.from(process.env.IV || '', 'hex'); // Use hex encoding for better security

// Ensure key and IV are the correct length
if (key.length !== 32) {
  console.error('Warning: Encryption key must be exactly 32 bytes (256 bits) for AES-256-CBC');
}

if (iv.length !== 16) {
  console.error('Warning: IV must be exactly 16 bytes (128 bits) for AES-256-CBC');
}

const bypassMethods = ["statusChange", "resetUsingMail", "login", "signup", "verify", "forgotPassword", "resendOTP", "resetPassword", "findNearestDriver"];

const middleware = {
    isJson: function (str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    checkValidationRules: async function (req, res, request, rules, message, keywords) {
        try {
            const v = Validator.make(request, rules, message, keywords);
            if (v.fails()) {
                const errors = v.getErrors();
                let error = "";
                for (const key in errors) {
                    error = errors[key][0];
                    break;
                }
                const request_data = {
                    code: "0",
                    message: error
                };
                const encryptedResponse = await this.encryption(request_data);
                res.status(400).send(encryptedResponse); // Changed status to 400 for validation failures
                return false;
            }
            return true;
        } catch (error) {
            console.error("Validation error:", error);
            res.status(500).send(await this.encryption({
                code: "0",
                message: "Internal server error"
            }));
            return false;
        }
    },

    send_response: async function (req, res, code, message, data) {
        try {
            const translated_message = this.getMessage(req.lang, message);
            const response_data = {
                code: code,
                message: translated_message,
                data: data
            };
            const encryptedResponse = await this.encryption(response_data);
            console.log("Encrypted response:", response_data);
            res.status(200).send(encryptedResponse);
        } catch (error) {
            console.error("Response error:", error);
            res.status(500).send(await this.encryption({
                code: "0",
                message: "Error sending response"
            }));
        }
    },

    getMessage: function (language, message) {
        try {
            console.log("getMessage input:", message);
            if (!message || !message.keyword) {
                return "Message translation error";
            }
            
            localizify
                .add('en', en)
                .add('ar', ar)
                .add('hi', hi)
                .setLocale(language || 'en');
                
            let translatedMessage = t(message.keyword);

            if (message.content) {
                Object.keys(message.content).forEach(key => {
                    translatedMessage = translatedMessage.replace(`{ ${key} }`, message.content[key]);
                });
            }
            return translatedMessage;
        } catch (error) {
            console.error("Translation error:", error);
            return message.keyword || "Message translation error";
        }
    },

    extractHeaderLanguage: function (req, res, next) {
        try {
            const headerlang = req.headers['accept-language'] || 'en';
            const validLanguages = ['en', 'ar', 'hi'];
            req.lang = validLanguages.includes(headerlang) ? headerlang : 'en';
            req.language = req.lang === 'en' ? en : (req.lang === 'ar' ? ar : hi);

            localizify
                .add('en', en)
                .add('ar', ar)
                .add('hi', hi)
                .setLocale(req.lang);
                
            next();
        } catch (error) {
            console.error("Language extraction error:", error);
            req.lang = 'en';
            req.language = en;
            next();
        }
    },

    encryption(requestData) {
        if (!requestData) {
            console.error("Empty data received for encryption.");
            return '';
        }
    
        try {
            const ivHex = process.env.IV;
            const keyHex = process.env.KEY;
    
            if (!ivHex || !keyHex) {
                console.error("IV or Key is undefined!");
                return '';
            }
    
            const iv = Buffer.from(ivHex.trim(), 'hex');
            const key = Buffer.from(keyHex.trim(), 'hex');
    
            if (iv.length !== 16) {
                console.error("Invalid IV length! It should be 16 bytes.");
                return '';
            }
    
            if (key.length !== 32) {
                console.error("Invalid Key length! It should be 32 bytes.");
                return '';
            }
    
            const data = typeof requestData === 'object' ? JSON.stringify(requestData) : String(requestData);
    
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');
    
            return encrypted;
        } catch (error) {
            console.error('Encryption Error:', error);
            return '';
        }
    },
    
    decryption(encryptedData) {
        if (!encryptedData) {
            console.error("Empty data received for decryption.");
            return null;
        }
    
        try {
            const ivHex = process.env.IV;
            const keyHex = process.env.KEY;
    
            if (!ivHex || !keyHex) {
                console.error("IV or Key is undefined!");
                return null;
            }
    
            const iv = Buffer.from(ivHex.trim(), 'hex');
            const key = Buffer.from(keyHex.trim(), 'hex');
    
            if (iv.length !== 16) {
                console.error("Invalid IV length! It should be 16 bytes.");
                return null;
            }
    
            if (key.length !== 32) {
                console.error("Invalid Key length! It should be 32 bytes.");
                return null;
            }
    
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
    
            // Optional: Try parsing as JSON if possible
            try {
                return JSON.parse(decrypted);
            } catch (err) {
                return decrypted; // Not JSON, return plain string
            }
        } catch (error) {
            console.error("Decryption Error:", error.message);
            return null;
        }
    },

    validateApiKey: async function (req, res, callback) {
        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != "") ? req.headers['api-key'] : '';
        if (api_key != "") {
            try {
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                let decrypted = decipher.update(api_key, 'base64', 'utf8');
                decrypted += decipher.final('utf8');
                if (decrypted != "" && decrypted == process.env.API_KEY) {
                    console.log("api key is set")
                    callback();
                } else {
                    response_data = {
                        code: '0',
                        message: "Invalid API Key"
                    }
                    const encryptedResponse = await middleware.encryption(response_data)
                    return res.status(401).send(encryptedResponse);
                }
            } catch (error) {
                response_data = {
                    code: '0',
                    message: "Invalid API Key"
                }
                const encryptedResponse = await middleware.encryption(response_data)
                return res.status(401).send(encryptedResponse);
            }
        } else {
            response_data = {
                code: '0',
                message: "Invalid API Key"
            }
            const encryptedResponse = await middleware.encryption(response_data)
            return res.status(401).send(encryptedResponse);
        }

    },

    // validateHeaderToken: async function (req, res, callback) {
    //     var headertoken = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';
    //     var path_data = req.path.split("/");
    //     console.log(headertoken)
    //     console.log(bypassMethods.indexOf(path_data[3]) === -1)
    //     console.log(path_data[2] == "admin")
    //     if (path_data[2] == "admin") {

    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 console.log("===token")
    //                 try {
    //                     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    //                     let dec_token = decipher.update(headertoken, 'base64', 'utf8');
    //                     dec_token += decipher.final('utf8');
    //                     console.log(dec_token)
    //                     if (dec_token != "") {
    //                         console.log("Token is set")
    //                         const [result] = await conn.query("select * from tbl_admin_device where admin_token=?", [dec_token])
    //                         if (!error && result.length > 0) {
    //                             req.admin_id = result[0].id;
    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }

    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     } else if (path_data[2] == "driver") {
    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 try {
    //                     var dec_token = crypto.decrypt(headertoken, shaKey, process.env.IV);
    //                     console.log(dec_token)
    //                     if (dec_token != "") {
    //                         const [result] = await conn.query("select tbl_driver_device.* from tbl_driver_device join tbl_driver on tbl_driver.id=tbl_driver_device.driver_id where tbl_driver_device.user_token=? and tbl_driver.is_active=1 and tbl_driver.is_deleted=0", [dec_token])

    //                         if (result.length > 0) {
    //                             req.user_id = result[0].driver_id;

    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }
    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     } else {
    //         if (bypassMethods.indexOf(path_data[3]) === -1) {
    //             if (headertoken != "") {
    //                 try {
    //                     const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    //                     let dec_token = decipher.update(headertoken, 'base64', 'utf8');
    //                     dec_token += decipher.final('utf8');
    //                     if (dec_token != "") {
    //                         console.log(dec_token)
    //                         const [result] = await conn.query("select tbl_user_device.* from tbl_user_device join tbl_user on tbl_user.id=tbl_user_device.user_id where tbl_user_device.user_token=? and tbl_user.is_active=1 and tbl_user.is_deleted=0", [dec_token])
    //                         if (result.length > 0) {
    //                             req.user_id = result[0].user_id;
    //                             console.log("token is set")
    //                             callback();
    //                         } else {
    //                             response_data = {
    //                                 code: '11',
    //                                 message: "Invalid token provided"
    //                             }
    //                             const encryptedResponse = await middleware.encryption(response_data)
    //                             return res.status(401).send(encryptedResponse);
    //                         }
    //                     } else {
    //                         response_data = {
    //                             code: '11',
    //                             message: "Please Provide Token"
    //                         }
    //                         const encryptedResponse = await middleware.encryption(response_data)
    //                         return res.status(401).send(encryptedResponse);
    //                     }
    //                 } catch (error) {
    //                     response_data = {
    //                         code: '11',
    //                         message: "Invalid token provided"
    //                     }
    //                     const encryptedResponse = await middleware.encryption(response_data)
    //                     return res.status(401).send(encryptedResponse);
    //                 }
    //             } else {
    //                 response_data = {
    //                     code: '11',
    //                     message: "Please Provide Token"
    //                 }
    //                 const encryptedResponse = await middleware.encryption(response_data)
    //                 return res.status(401).send(encryptedResponse);
    //             }
    //         } else {
    //             callback();
    //         }
    //     }
    // },

validateHeaderToken: async function (req, res, callback) {
    const headertoken = req.headers['token'] || '';
    const path_data = req.path.split("/");

    const role = path_data[2]; // 'admin', 'driver', or default (user)
    const action = path_data[3];

    const isBypassed = bypassMethods.includes(action);
    if (isBypassed) return callback();

    if (!headertoken) {
        const response_data = { code: '11', message: "Please Provide Token" };
        const encryptedResponse = await middleware.encryption(response_data);
        return res.status(401).send(encryptedResponse);
    }

    let decryptedToken;
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        decryptedToken = decipher.update(headertoken, 'base64', 'utf8') + decipher.final('utf8');
        console.log("Decrypted token:", decryptedToken);
    } catch (error) {
        const response_data = { code: '11', message: "Invalid token provided" };
        const encryptedResponse = await middleware.encryption(response_data);
        console.log("Decryption error:", error);
        return res.status(401).send(encryptedResponse);
        
    }

    // if (!decryptedToken) {
    //     const response_data = { code: '11', message: "Invalid token provided" };
    //     const encryptedResponse = await middleware.encryption(response_data);
    //     return res.status(401).send(encryptedResponse);
    // }

    try {
        let query = '';
        let params = [];
        let result;

        if (role === 'admin') {
            query = "SELECT * FROM tbl_admin_device WHERE admin_token = ?";
            [result] = await conn.query(query, [decryptedToken]);
            
            if (result.length > 0) {
                req.admin_id = result[0].id;
                console.log("Admin ID set:", req.admin_id);
                return callback();
            }
            
        } else if (role === 'driver') {
            query = `
                SELECT tbl_driver_device.* 
                FROM tbl_driver_device 
                JOIN tbl_driver ON tbl_driver.id = tbl_driver_device.driver_id 
                WHERE tbl_driver_device.user_token = ? 
                AND tbl_driver.is_active = 1 AND tbl_driver.is_deleted = 0`;
            [result] = await conn.query(query, [decryptedToken]);
            if (result.length > 0) {
                req.user_id = result[0].driver_id;
                return callback();
            }
        } else {
            query = `
                select tbl_user_device.* from tbl_user_device join tbl_user on tbl_user.id=tbl_user_device.user_id where tbl_user_device.user_token=? and tbl_user.is_active=1 and tbl_user.is_deleted=0`;
            [result] = await conn.query(query, [decryptedToken]);
            // console.log("User token result:", result);
            if (result.length > 0) {
                req.user_id = result[0].user_id;
                return callback();
            }
        }

        const response_data = { code: '11', message: "Invalid token provided" };
        const encryptedResponse = await middleware.encryption(response_data);
        return res.status(401).send(encryptedResponse);

    } catch (err) {
        console.error("Token validation error:", err);
        const response_data = { code: '11', message: "Token verification failed" };
        const encryptedResponse = await middleware.encryption(response_data);
        return res.status(500).send(encryptedResponse);
    }
}


};

module.exports = middleware;