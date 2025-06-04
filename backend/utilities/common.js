const responseCode = require("./response-error-code");
const conn = require("../config/database");
const cryptLib = require("cryptlib");
const constant = require("../config/constant");
const nodemailer=require('nodemailer');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || "khushitekwani";

class Common {
    response(res, message) {
        res.status(200).json(this.encrypt(message));
    }

    // generateToken(length = 5) {
    //     const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //     return Array.from({ length }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('');
    // }

    
    generateJwtToken = (payload) => {
        return jwt.sign(payload, secret, { expiresIn: '7d' });
      };


    generateOTP() {
        return (Math.floor(1000 + Math.random() * 9000)).toString();
    }

    generateOrderNumber() {
        return `ORD${Math.floor(100000 + Math.random() * 900000)}`;
    }


    async getUserDetail(user_id) {
        console.log("common 11");
        try {
            console.log("common 1");
            const selectQuery = "SELECT * FROM tbl_user WHERE id=?";
            const [result] = await conn.query(selectQuery, [user_id]);
            console.log("common 2");
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.log("common 3");
            console.error("Error fetching user details:", error);
            return null;
        }
    }

    async getAdminDetail(admin_id) {
        console.log("common 11");
        try {
            console.log("common 1");
            const selectQuery = "SELECT * FROM tbl_admin WHERE id=?";
            const [result] = await conn.query(selectQuery, [admin_id]);
            console.log("common 2");
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.log("common 3");
            console.error("Error fetching admin details:", error);
            return null;
        }
    }


    async getDriverDetail(user_id) {

        try {

            const selectQuery = "SELECT * FROM tbl_driver WHERE id=?";
            const [result] = await conn.query(selectQuery, [user_id]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {

            console.error("Error fetching driver details:", error);
            return null;
        }
    }

    async updateDeviceDetails(id, data) {
        try {
            const query = "UPDATE tbl_user_device SET ? WHERE user_id=?";
            await conn.query(query, [data, id]);
            return await this.getUserDetail(id);
        } catch (error) {
            console.error("Error updating device details:", error);
            return null;
        }
    }

    async updateAdminDeviceDetails(id, data) {
        try {
            const query = "UPDATE tbl_admin_device SET ? WHERE admin_id=?";
            await conn.query(query, [data, id]);
            return await this.getAdminDetail(id);
        } catch (error) {
            console.error("Error updating device details:", error);
            return null;
        }
    }

    async updateUserInfo(id, data) {
        try {
            const query = "UPDATE tbl_user SET ? WHERE id=?";
            await conn.query(query, [data, id]);
            return await this.getUserDetail(id);
        } catch (error) {
            console.error("Error updating user info:", error);
            return null;
        }
    }

    async updateAdminInfo(id, data) {
        try {
            const query = "UPDATE tbl_admin SET ? WHERE id=?";
            await conn.query(query, [data, id]);
            return await this.getAdminDetail(id);
        } catch (error) {
            console.error("Error updating admin info:", error);
            return null;
        }
    }


    async updateDriverInfo(id, data) {
        try {
            const query = "UPDATE tbl_driver SET ? WHERE id=?";
            await conn.query(query, [data, id]);
            return await this.getDriverDetail(id);
        } catch (error) {
            console.error("Error updating driver info:", error);
            return null;
        }
    }
    async sendMail(subject, to_email, message) {
        try {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: constant.mailer_email,
                    pass: constant.mailer_password
                }
            })
            var mailOptions = {
                from: constant.from_email,
                to: to_email,
                subject: subject,
                html: message
            }
            var [result] = await transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            return null;
        }
    }
    async sendEmailOTP(to_email, subject,otp_msg,otp) {
        try{
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,                   
                auth: {
                    user: constant.mailer_email,                
                    pass: constant.mailer_password            
                }
            });         
            var mailOptions = {
                from: constant.from_email,      
                to: to_email,       
                subject: subject, 
                html: "<h1>" + otp_msg + otp+ "</h1>"
            };
            var [result] = await transporter.sendMail(mailOptions);
            return result;
        }catch(error){
            return null;
        }
        
    }
}

module.exports = new Common();
