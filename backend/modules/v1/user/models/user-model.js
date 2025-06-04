let conn = require("../../../../config/database");
// let md5 = require("md5");
let responseCode = require("../../../../utilities/response-error-code");
let common = require("../../../../utilities/common");
let constant = require("../../../../config/constant");
// const middleware = require("../../../../middleware/validators")
// const cron = require("node-cron");
// let cryptoLib = require('cryptlib');
// // var template_data = require("../../../../template")
// var shaKey = cryptoLib.getHashSha256(process.env.KEY, 32)
const { t } = require("localizify");
const bcrypt = require("bcrypt");

class userModel {
  async signup(request_data) {
    try {
      var base_url = constant.base_url;
      var data = {
        name: request_data.name,
        login_type: request_data.login_type,
        // address: request_data.address,
        // latitude: request_data.latitude,
        // longitude: request_data.longitude,
        // profile_image: request_data.profile_image,
      };

      if (request_data.password !== undefined) {
        const saltRounds = 10;
        data.password = await bcrypt.hash(request_data.password, saltRounds);
      }

      if (request_data.social_id !== undefined) {
        data.social_id = request_data.social_id;
      }

      if (
        request_data.login_type !== undefined &&
        request_data.login_type !== "simple"
      ) {
        data.is_verified = 1;
      }

      if (request_data.email !== undefined && request_data.email !== "") {
        data.email = request_data.email;
      }

      var q =
        "SELECT * FROM tbl_user WHERE (email=?) AND ((is_active=1 AND is_deleted=0) OR (is_active=0 AND is_deleted=0))";
      var [result] = await conn.query(q, [request_data.email]);

      if (result.length > 0) {
        return {
          code: responseCode.OPERATION_FAILED,
          message: {
            keyword: t("user_already_exists"),
            content: { field: "email" },
          },
        };
      }

      var insertQuery = "INSERT INTO tbl_user SET ?";
      var result = await conn.query(insertQuery, data);
      var user_id = result[0].insertId;
      const tokenPayload = { id: user_id, email: request_data.email };
      const jwtToken = common.generateJwtToken(tokenPayload);

      var deviceData = {
        user_id: user_id,
        // device_type: request_data.device_type,
        // os_version: request_data.os_version,
        // app_version: request_data.app_version,
        device_token: jwtToken,
        user_token: jwtToken,
        // time_zone: request_data.time_zone,
      };
      var q = "INSERT INTO tbl_user_device SET ?";
      await conn.query(q, deviceData);

      var userDetails = await common.getUserDetail(user_id);

      var otpData = {
        otp: common.generateOTP(),
        user_id: user_id,
        mobile: request_data.mobile,
      };
      var que = "INSERT INTO tbl_user_otp SET ?";
      await conn.query(que, otpData);

      var q = `SELECT * FROM tbl_user_device WHERE user_id= ?`;
      var [deviceResult] = await conn.query(q, [user_id]);

      Object.assign(userDetails, deviceResult[0]);
      userDetails.profile_image = `${base_url}/${userDetails.profile_image}`;

      return {
        code: responseCode.SUCCESS,
        message: {
          keyword: t("signup_successfull"),
          content: { name: data.name },
        },
        data: userDetails,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: {
          keyword: error.message,
        },
      };
    }
  }

  async login(req) {
    try {
      let base_url = constant.base_url;
      let request_data = req.body;
      let q = "";
      let condition = [];
      let plainPassword = request_data.password;

      if (request_data.login_type === "simple") {
        if (request_data.email !== undefined && request_data.email !== "") {
          q =
            "SELECT * FROM tbl_user WHERE email=? AND is_active=1 AND is_deleted=0";
          condition = [request_data.email];
        }
      } else {
        q =
          "SELECT * FROM tbl_user WHERE social_id=? AND is_active=1 AND is_deleted=0";
        condition = [request_data.social_id];
      }

      let [result] = await conn.query(q, condition);

      if (result.length === 0) {
        console.log("result", result);
        return {
          code: responseCode.OPERATION_FAILED,
          message: {
            keyword: t("login_invalid_credential"),
            content: {
              credential:
                request_data.login_type === "simple"
                  ? "Email / phone or Password"
                  : "Social ID",
            },
          },
        };
      }

      let user = result[0];

      if (request_data.login_type === "simple") {
        const passwordMatch = await bcrypt.compare(
          plainPassword,
          user.password
        );
        if (!passwordMatch) {
          return {
            code: responseCode.OPERATION_FAILED,
            message: {
              keyword: t("login_invalid_credential"),
              content: { credential: "Email / phone or Password" },
            },
          };
        }
      }

      if (user.is_active === 1) {
        if (user.is_deleted === 0) {
          const tokenPayload = { id: user.id, email: user.email };
          const jwtToken = common.generateJwtToken(tokenPayload);

          let deviceData = {
            // device_type: request_data.device_type,
            // os_version: request_data.os_version,
            // app_version: request_data.app_version,
            device_token: jwtToken,
            user_token: jwtToken,
            // time_zone: request_data.time_zone,
          };
          // let updateData = {
          // latitude: request_data.latitude,
          // longitude: request_data.longitude,
          // };

          // await conn.query("UPDATE tbl_user SET ? WHERE id=?", [
          //   updateData,
          //   user.id,
          // ]);
          await conn.query("UPDATE tbl_user_device SET ? WHERE user_id=?", [
            deviceData,
            user.id,
          ]);

          let [userResult] = await conn.query(
            "SELECT * FROM tbl_user WHERE id=?",
            [user.id]
          );
          // let d = { ...userResult[0] };
          // d.profile_image = `${base_url}/${d.profile_image}`;

          // let [deviceResult] = await conn.query(
          //   "SELECT * FROM tbl_user_device WHERE user_id=?",
          //   [user.id]
          // );
          // d.deviceDetails = deviceResult[0];

          return {
            code: responseCode.SUCCESS,
            message: {
              keyword: t("login_success"),
              content: { name: user.name },
            },
            data: {
              // ...d,
              token: jwtToken,
            },
          };
        } else {
          return {
            code: responseCode.NOT_REGISTER,
            message: { keyword: t("login_invalid_credential") },
          };
        }
      } else {
        return {
          code: responseCode.CODE_NULL,
          message: { keyword: t("user_blocked") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getUserClubs(req) {
    try {
      let user_id = req.user_id;
      let q = `
        SELECT 
          uc.*,
          c.name AS club_name,
          c.description,
          c.club_image
        FROM tbl_user_club uc
        JOIN tbl_club c ON uc.club_id = c.id
        WHERE uc.user_id = ? AND c.is_active = 1 AND c.is_deleted = 0
      `;
      let [result] = await conn.query(q, [user_id]);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("club_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("club_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async allClubs(req) {
    try {
      let q = "SELECT * FROM tbl_club WHERE is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q);

      if (result.length > 0) {
        for (let club of result) {
          const activeMembersQuery = `
            SELECT COUNT(*) AS active_members
            FROM tbl_user_club uc
            WHERE uc.club_id = ? AND uc.is_active = 1 AND uc.is_deleted = 0
          `;
          const [activeMembersResult] = await conn.query(activeMembersQuery, [
            club.id,
          ]);

          club.active_members = activeMembersResult[0].active_members;
        }

        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("club_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("club_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async joinClub(req) {
    try {
      let user_id = req.user_id;
      let club_id = req.body.club_id;
  
      const [clubResult] = await conn.query(
        `SELECT * FROM tbl_club WHERE id = ? AND is_deleted = 0 AND is_active = 1`,
        [club_id]
      );
      if (clubResult.length === 0) {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("club_not_found") },
        };
      }
  
      const book_id = clubResult[0].book_id;
  
      const [existing] = await conn.query(
        `SELECT * FROM tbl_user_club WHERE user_id = ? AND club_id = ?`,
        [user_id, club_id]
      );
      if (existing.length > 0) {
        return {
          code: responseCode.ALREADY_EXISTS,
          message: { keyword: t("already_joined") },
          data: existing[0],
        };
      }
  
      const userClubData = { user_id, club_id };
      await conn.query(`INSERT INTO tbl_user_club SET ?`, userClubData);
  
      const progressData = {
        user_id,
        book_id,
        completion_percentage: 0,
        progress: 'not-started',
      };
      await conn.query(`INSERT INTO tbl_book_progress SET ?`, progressData);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("club_joined") },
        data: { ...userClubData, book_id },
      };
    } catch (error) {
      console.error("Join club error:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async leaveClub(req) {
  try {
    let user_id = req.user_id;
    let club_id = req.body.club_id;

    // Check if club exists
    const [clubResult] = await conn.query(
      `SELECT * FROM tbl_club WHERE id = ? AND is_deleted = 0 AND is_active = 1`,
      [club_id]
    );
    if (clubResult.length === 0) {
      return {
        code: responseCode.NO_DATA_FOUND,
        message: { keyword: t("club_not_found") },
      };
    }

    await conn.query(
      `DELETE FROM tbl_user_club WHERE user_id = ? AND club_id = ?`,
      [user_id, club_id]
    );

    const book_id = clubResult[0].book_id;

    await conn.query(
      `DELETE FROM tbl_book_progress WHERE user_id = ? AND book_id = ?`,
      [user_id, book_id]
    );

    return {
      code: responseCode.SUCCESS,
      message: { keyword: t("club_left") },
      data: { user_id, club_id },
    };
  } catch (error) {
    console.error("Leave club error:", error);
    return {
      code: responseCode.OPERATION_FAILED,
      message: { keyword: error.message },
    };
  }
  }

  async getAllBooks(req) {
    try {
      let q = `SELECT tbl_book.*, tbl_club.* FROM tbl_book 
        JOIN tbl_club ON tbl_book.id = tbl_club.book_id
        WHERE is_active = 1 AND is_deleted = 0`;
      let [result] = await conn.query(q);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("book_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("book_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async allBooks(req) {
    try {
      let user_id = req.user_id;
  
      let q = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b.is_active,
          b.is_deleted,
          b.created_at,
          b.updated_at,
          p.progress AS book_progress,
          p.completion_percentage,
          MIN(c.id) AS club_id  
        FROM tbl_book b
        JOIN tbl_club c ON b.id = c.book_id AND c.is_active = 1 AND c.is_deleted = 0
        LEFT JOIN tbl_book_progress p ON b.id = p.book_id AND p.user_id = ?
        WHERE b.is_active = 1 AND b.is_deleted = 0
        GROUP BY b.id, b.title, b.author, b.description, b.is_active, b.is_deleted, b.created_at, b.updated_at, p.progress, p.completion_percentage
              `;
  
      let [result] = await conn.query(q, [user_id]);
  
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("book_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("book_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async updateBookProgress(req) {
    try {
      let user_id = req.user_id;
      let book_id = req.body.book_id;
      let progress = req.body.book_progress;
      let completion_percentage = req.body.completion_percentage || 0;

      let q = `SELECT * FROM tbl_book WHERE id= ?`;
      let [bookResult] = await conn.query(q, [book_id]);

      if (bookResult.length === 0) {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("book_not_found") },
        };
      }

      q = `SELECT * FROM tbl_book_progress WHERE user_id= ? AND book_id= ?`;
      let [progressResult] = await conn.query(q, [user_id, book_id]);

      if (progressResult.length > 0) {
        q = `UPDATE tbl_book_progress SET progress= ?, completion_percentage= ? WHERE user_id= ? AND book_id= ?`;
        await conn.query(q, [
          progress,
          completion_percentage,
          user_id,
          book_id,
        ]);
      } else {
        let data = {
          user_id: user_id,
          book_id: book_id,
          progress: progress,
          completion_percentage: completion_percentage,
        };
        q = "INSERT INTO tbl_book_progress SET ?";
        await conn.query(q, data);
      }

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("book_progress_updated") },
        data: { user_id, book_id, progress, completion_percentage },
      };
    } catch (error) {
      console.error("Update book progress error:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getDiscussions(req) {
    try {
      const user_id = req.user_id;

      const q = `
            SELECT 
        d.id AS discussion_id,
        d.title,
        d.content,
        d.created_at AS discussion_created_at,
        d.user_id AS discussion_user_id,
        u.name AS discussion_owner_name,
        c.id AS comment_id,
        c.comment,
        COUNT(c.id) OVER (PARTITION BY d.id) AS comments_count,
        c.created_at AS comment_created_at,
        cu.name AS commenter_name
      FROM tbl_discussion AS d
      JOIN tbl_user AS u ON d.user_id = u.id
      LEFT JOIN tbl_chat AS c ON c.discussion_id = d.id AND c.is_active = 1 AND c.is_deleted = 0
      LEFT JOIN tbl_user AS cu ON cu.id = c.user_id
      WHERE d.is_active = 1 AND d.is_deleted = 0
        AND (d.user_id = ? OR d.id IN (
          SELECT discussion_id 
          FROM tbl_chat 
          WHERE commenting_user_id = ? AND is_active = 1 AND is_deleted = 0
        ))
      ORDER BY d.id, c.created_at


      `;

      const [rows] = await conn.query(q, [user_id, user_id, user_id]);

      const discussionsMap = new Map();

      for (const row of rows) {
        if (!discussionsMap.has(row.discussion_id)) {
          discussionsMap.set(row.discussion_id, {
            discussion_id: row.discussion_id,
            title: row.title,
            content: row.content,
            created_at: row.discussion_created_at,
            user: {
              id: row.discussion_user_id,
              name: row.discussion_owner_name,
            },
            comments_by_user: [],
            replies: [],
          });
        }

        if (row.comment_id) {
          discussionsMap.get(row.discussion_id).comments_by_user.push({
            comment_id: row.comment_id,
            comment: row.comment,
            commenter_name: row.commenter_name,
            comments_count: row.comments_count,
            created_at: row.comment_created_at,
          });
        }
        
      }

      const result = Array.from(discussionsMap.values());

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("discussion_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("discussion_not_found") },
          data: [], 
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
        data: [], 
      };
    }
  }

  async createDiscussion(req) {
    try {
      const user_id = req.user_id;
      const book_id = req.body.book_id;

      const data = {
        user_id,
        title: req.body.title,
        content: req.body.content,
        book_id: book_id,
      };
      const insertQuery = "INSERT INTO tbl_discussion SET ?";
      await conn.query(insertQuery, data);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("discussion_created") },
        data,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async addReplyToDiscussion(req) {
    try {
      const user_id = req.user_id;
      const { discussion_id, comment } = req.body;

      const data = {
        user_id,
        discussion_id,
        comment,
      };
      console.log("data", data);

      const insertQuery = "INSERT INTO tbl_chat SET ?";
      await conn.query(insertQuery, data);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("comment_added") },
        data,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async likeDiscussionReply(req) {
    try {
      const user_id = req.user_id;
      const { comment_id, discussion_id } = req.body;
  
      const checkQuery = `
        SELECT is_like FROM tbl_chat 
        WHERE id = ? AND user_id = ? AND discussion_id = ?`;
      const [existing] = await conn.query(checkQuery, [comment_id, user_id, discussion_id]);
  
      if (existing.length > 0 && existing[0].is_like === 1) {
        return {
          code: responseCode.CODE_NULL,
          message: { keyword: t("reply_already_liked") },
        };
      }
  
      const updateQuery = `
        UPDATE tbl_chat 
        SET is_like = 1 
        WHERE id = ? AND user_id = ? AND discussion_id = ?`;
      await conn.query(updateQuery, [comment_id, user_id, discussion_id]);

      const countQuery = `
        SELECT COUNT(*) AS like_count 
        FROM tbl_chat 
        WHERE id = ? AND is_like = 1`;
      const [countResult] = await conn.query(countQuery, [comment_id]);
      const like_count = countResult[0].like_count || 0;
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("reply_liked") },
        data: {
          comment_id,
          user_id,
          like_count
        },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }















  async addCommentToReply(req) {
    try {
      const user_id = req.user_id;
      const { comment_id, comment } = req.body;

      const data = {
        user_id,
        comment_id,
        comment,
      };

      const insertQuery = "INSERT INTO tbl_discussion_reply_comment SET ?";
      await conn.query(insertQuery, data);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("comment_added") },
        data,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getUserProfile(req) {
    try {
      // let base_url = constant.base_url;
      let user_id = req.user_id;
      console.log("user_id", user_id);
      let q = `SELECT * FROM tbl_user WHERE id= ?`;
      let [result] = await conn.query(q, [user_id]);
      console.log("result", result);
      if (result.length > 0) {
        // let d = { ...result[0] };
        // d.profile_image = `${base_url}/${d.profile_image}`;
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("user_details") },
          data: result[0],
        };
      } else {
        return {
          code: responseCode.NOT_REGISTER,
          message: { keyword: t("user_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async allProducts(req) {
    try {
      let q = "SELECT * FROM tbl_product WHERE is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("product_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("product_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getUserOrders(req) {
    try {
      let user_id = req.user_id;
      let q = `SELECT * FROM tbl_order WHERE user_id= ?`;
      let [result] = await conn.query(q, [user_id]);
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("order_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("order_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async addItemToCart(req) {
    try {
      let user_id = req.user_id;
      let product_id = req.body.product_id;
      let quantity = req.body.quantity || 1;

      let q = `SELECT * FROM tbl_cart WHERE user_id= ? AND product_id= ?`;
      let [result] = await conn.query(q, [user_id, product_id]);
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("item_already_in_cart") },
        };
      } else {
        let data = {
          user_id: user_id,
          product_id: product_id,
          quantity: quantity,
        };
        let insertQuery = "INSERT INTO tbl_cart SET ?";
        await conn.query(insertQuery, data);
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("item_added_to_cart") },
          data: user_id,
          product_id,
          quantity,
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async addItemToWishlist(req) {
    try {
      let user_id = req.user_id;
      let product_id = req.body.product_id;

      console.log("product_id", product_id);
      let q = `SELECT * FROM tbl_wishlist WHERE user_id= ? AND product_id= ?`;
      let [result] = await conn.query(q, [user_id, product_id]);
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("item_already_in_wishlist") },
        };
      } else {
        let data = {
          user_id: user_id,
          product_id: product_id,
        };
        let insertQuery = "INSERT INTO tbl_wishlist SET ?";
        await conn.query(insertQuery, data);
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("item_added_to_wishlist") },
          data: data,
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async removeCartItem(req) {
    try {
      let user_id = req.user_id;
      let cart_id = req.body.cart_id;
      let q = `DELETE FROM tbl_cart WHERE id= ? AND user_id= ?`;
      await conn.query(q, [cart_id, user_id]);
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("item_removed_from_cart") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async increaseCartItem(req) {
    try {
      const user_id = req.user_id;
      const cart_id = req.body.cart_id;

      // Increment quantity by 1
      const [result] = await conn.query(
        `UPDATE tbl_cart SET quantity = quantity + 1 WHERE id = ? AND user_id = ?`,
        [cart_id, user_id]
      );
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("item_quantity_updated") },
        data: cart_id,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async decreaseCartItem(req) {
    try {
      const user_id = req.user_id;
      const cart_id = req.body.cart_id;

      // Decrement quantity by 1
      const [result] = await conn.query(
        `UPDATE tbl_cart SET quantity = quantity - 1 WHERE id = ? AND user_id = ?`,
        [cart_id, user_id]
      );

      if (result.affectedRows === 0) {
        return {
          code: responseCode.NOT_FOUND,
          message: { keyword: t("cart_item_not_found") },
        };
      }

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("item_quantity_updated") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async removeWishlistItem(req) {
    try {
      let user_id = req.user_id;
      let wishlist_id = req.body.wishlist_id;
      let q = `DELETE FROM tbl_wishlist WHERE id= ? AND user_id= ?`;
      await conn.query(q, [wishlist_id, user_id]);
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("item_removed_from_wishlist") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getCartItems(req) {
    try {
      let user_id = req.user_id;
      let q = `
        SELECT 
          c.*,
          p.name AS product_name,
          p.description,
          p.price,
          p.product_image
        FROM tbl_cart c
        JOIN tbl_product p ON c.product_id = p.id
        WHERE c.user_id = ? AND p.is_active = 1 AND p.is_deleted = 0
      `;

      let [result] = await conn.query(q, [user_id]);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("cart_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("cart_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getCartCount(req) {
    try {
      let user_id = req.user_id;
      let q = `SELECT COUNT(*) as cart_count FROM tbl_cart WHERE user_id= ?`;
      let [result] = await conn.query(q, [user_id]);
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("cart_count") },
        data: result[0].cart_count,
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getUserWishlist(req) {
    try {
      const user_id = req.user_id;

      const q = `
        SELECT 
          w.id AS wishlist_id,
          w.user_id,
          w.product_id,
          p.name AS product_name,
          p.description,
          p.price,
          p.product_image,
          p.is_active,
          p.category_id,
          c.name AS category_name
        FROM 
          tbl_wishlist w
        INNER JOIN 
          tbl_product p ON w.product_id = p.id
        LEFT JOIN 
          tbl_category c ON p.category_id = c.id
        WHERE 
          w.user_id = ? AND p.is_deleted = 0 AND p.is_active = 1
      `;

      const [result] = await conn.query(q, [user_id]);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("wishlist_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("wishlist_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }
}

module.exports = new userModel();
