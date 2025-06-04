let conn = require("../../../../config/database");
let responseCode = require("../../../../utilities/response-error-code");
let common = require("../../../../utilities/common");
let constant = require("../../../../config/constant");
const { t } = require("localizify");
const bcrypt = require("bcrypt");

class adminModel {

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
        "SELECT * FROM tbl_admin WHERE (email=?) AND ((is_active=1 AND is_deleted=0) OR (is_active=0 AND is_deleted=0))";
      var [result] = await conn.query(q, [request_data.email]);

      if (result.length > 0) {
        return {
          code: responseCode.OPERATION_FAILED,
          message: {
            keyword: t("admin_already_exists"),
            content: { field: "email" },
          },
        };
      }

      var insertQuery = "INSERT INTO tbl_admin SET ?";
      var result = await conn.query(insertQuery, data);
      var admin_id = result[0].insertId;
      const tokenPayload = { id: admin_id, email: request_data.email };
      const jwtToken = common.generateJwtToken(tokenPayload);

      var deviceData = {
        admin_id: admin_id,
        // device_type: request_data.device_type,
        // os_version: request_data.os_version,
        // app_version: request_data.app_version,
        device_token: jwtToken,
        admin_token: jwtToken,
        // time_zone: request_data.time_zone,
      };
      var q = "INSERT INTO tbl_admin_device SET ?";
      await conn.query(q, deviceData);

      var adminDetails = await common.getAdminDetail(admin_id);

      var otpData = {
        otp: common.generateOTP(),
        admin_id: admin_id,
        mobile: request_data.mobile,
      };
      var que = "INSERT INTO tbl_admin_otp SET ?";
      await conn.query(que, otpData);

      var q = `SELECT * FROM tbl_admin_device WHERE admin_id= ?`;
      var [deviceResult] = await conn.query(q, [admin_id]);

      Object.assign(adminDetails, deviceResult[0]);
      adminDetails.profile_image = `${base_url}/${adminDetails.profile_image}`;

      return {
        code: responseCode.SUCCESS,
        message: {
          keyword: t("signup_successfull"),
          content: { name: data.name }
        },
        data: adminDetails,
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
            "SELECT * FROM tbl_admin WHERE email=? AND is_active=1 AND is_deleted=0";
          condition = [request_data.email];
        }
      } else {
        q =
          "SELECT * FROM tbl_admin WHERE social_id=? AND is_active=1 AND is_deleted=0";
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

      let admin = result[0];

      if (request_data.login_type === "simple") {
        const passwordMatch = await bcrypt.compare(
          plainPassword,
          admin.password
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

      if (admin.is_active === 1) {
        if (admin.is_deleted === 0) {
          const tokenPayload = { id: admin.id, email: admin.email };
          const jwtToken = common.generateJwtToken(tokenPayload);

          let deviceData = {
            // device_type: request_data.device_type,
            // os_version: request_data.os_version,
            // app_version: request_data.app_version,
            device_token: jwtToken,
            admin_token: jwtToken,
            // time_zone: request_data.time_zone,
          };
          // let updateData = {
            // latitude: request_data.latitude,
            // longitude: request_data.longitude,
          // };

          // await conn.query("UPDATE tbl_admin SET ? WHERE id=?", [
          //   updateData,
          //   admin.id,
          // ]);
          await conn.query("UPDATE tbl_admin_device SET ? WHERE admin_id=?", [
            deviceData,
            admin.id,
          ]);

          let [adminResult] = await conn.query(
            "SELECT * FROM tbl_admin WHERE id=?",
            [admin.id]
          );
          // let d = { ...adminResult[0] };
          // d.profile_image = `${base_url}/${d.profile_image}`;

          // let [deviceResult] = await conn.query(
          //   "SELECT * FROM tbl_admin_device WHERE admin_id=?",
          //   [admin.id]
          // );
          // d.deviceDetails = deviceResult[0];

          return {
            code: responseCode.SUCCESS,
            message: {
                keyword: t('login_success'),
                content: { name: admin.name }
            },
            data: {
                // ...d,
                token: jwtToken
            }
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
          message: { keyword: t("admin_blocked") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async logout(req) {
    try {

        // let u = await cryptoLib.decrypt(req.headers['token'], shaKey, process.env.IV);
        let device_token = req.body.device_token;

        let q = "UPDATE tbl_admin_device SET admin_token=null, device_token=null WHERE admin_token=? AND device_token=?";
        let [result] = await conn.query(q, [u, device_token]);

        if (result.affectedRows == 0) {
            return {
                code: responseCode.REQUEST_ERROR,
                message: {
                    keyword: t('no_data_found')
                }
            };
        } else {
            return {
                code: responseCode.SUCCESS,
                message: {
                    keyword: t('logout_success')
                }
            };
        }
    } catch (error) {
        return {
            code: responseCode.OPERATION_FAILED,
            message: {
                keyword: error.message
            }
        };
    }
  }

  async allBooks(req) {
    try {
      const q = `
        SELECT 
          b.*, 
          GROUP_CONCAT(g.genre ORDER BY g.genre SEPARATOR ', ') AS genres
        FROM 
          tbl_book AS b
        LEFT JOIN 
          tbl_book_genre AS bg ON b.id = bg.book_id AND bg.is_active = 1 AND bg.is_deleted = 0
        LEFT JOIN 
          tbl_genre AS g ON bg.genre_id = g.id AND g.is_active = 1 AND g.is_deleted = 0
        WHERE 
          b.is_active = 1 AND b.is_deleted = 0
        GROUP BY 
          b.id
      `;
  
      const [result] = await conn.query(q);
  
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
  
  async addBook(req) {
    const { title, description, author, genres } = req.body; 
  
    try {
      const insertBookQuery = `
        INSERT INTO tbl_book (title, description, author)
        VALUES (?, ?, ?)
      `;
  
      const [bookResult] = await conn.query(insertBookQuery, [title, description, author]);
  
      const bookId = bookResult.insertId;
  
      if (genres && genres.length > 0) {
        const insertBookGenresQuery = `
          INSERT INTO tbl_book_genre (book_id, genre_id)
          VALUES ?
        `;
        
        const bookGenresData = genres.map(genreId => [bookId, genreId]);
        
        await conn.query(insertBookGenresQuery, [bookGenresData]);
      }
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("book_added_successfully") },
        data: { book_id: bookId },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async updateBook(req) {
    const { id, title, description, author, genres } = req.body; 
  
    try {
      const updateBookQuery = `
        UPDATE tbl_book
        SET title = ?, description = ?, author = ?
        WHERE id = ?
      `;
  
      await conn.query(updateBookQuery, [title, description, author, id]);
  
      if (genres && genres.length > 0) {
        const deleteOldGenresQuery = `
          DELETE FROM tbl_book_genre
          WHERE book_id = ?
        `;
  
        await conn.query(deleteOldGenresQuery, [id]);
  
        const insertBookGenresQuery = `
          INSERT INTO tbl_book_genre (book_id, genre_id)
          VALUES ?
        `;
        
        const bookGenresData = genres.map(genreId => [id, genreId]);
        
        await conn.query(insertBookGenresQuery, [bookGenresData]);
      }
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("book_updated_successfully") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async getBookById(req) {  
    const { book_id } = req.body; 
  
    try {
      const q = `
        SELECT b.*, bg.*, g.* FROM TBL_BOOK as b
        join tbl_book_genre as bg on b.id=bg.book_id
        join tbl_genre as g on bg.genre_id=g.id
      `;
  
      const [result] = await conn.query(q, [book_id]);
      console.log("result", result);
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("book_found") },
          data: result[0],
          
        };
      
      } 
      else {
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
  
  async genres(req){
    try {
      let q = "SELECT * FROM tbl_genre WHERE is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("genre_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("genre_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async deleteBook(req) {
    try {
      let request_data = req.body;
      let book_id = request_data.book_id;
  
      // Step 1: Delete book-genre relations
      const deleteGenreRelationQuery = `
        DELETE FROM tbl_book_genre 
        WHERE book_id = ? 
          AND is_active = 1 
          AND is_deleted = 0
      `;
      await conn.query(deleteGenreRelationQuery, [book_id]);
  
      // Step 2: Delete the book itself
      const deleteBookQuery = `
        DELETE FROM tbl_book 
        WHERE id = ? 
          AND is_active = 1 
          AND is_deleted = 0
      `;
      await conn.query(deleteBookQuery, [book_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("book_deleted") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async allUsers(req) {
    try {
      let q = `
        SELECT 
          u.*,
          CASE 
            WHEN AVG(bp.completion_percentage) IS NULL THEN 'not reading'
            WHEN AVG(bp.completion_percentage) = 0 THEN 'not reading'
            WHEN AVG(bp.completion_percentage) = 100 THEN 'completed'
            ELSE 'reading'
          END AS reading_status,
  
          -- Total books completed
          COUNT(DISTINCT CASE WHEN bp.completion_percentage = 100 THEN bp.book_id END) AS books_read,
  
          -- Total discussions created
          COUNT(DISTINCT d.id) AS discussion_count
  
        FROM tbl_user u
        LEFT JOIN tbl_book_progress bp ON bp.user_id = u.id AND bp.is_active = 1 AND bp.is_deleted = 0
        LEFT JOIN tbl_discussion d ON d.user_id = u.id AND d.is_active = 1 AND d.is_deleted = 0
  
        WHERE u.is_active = 1 AND u.is_deleted = 0
        GROUP BY u.id
      `;
  
      let [result] = await conn.query(q);
  
      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("user_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
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

  async allDiscussions(req) {
    try {
      const q = `
        SELECT 
          d.*, 
          u.name AS user_name, 
          b.title AS book_title,
          COUNT(c.id) AS replies_count
        FROM tbl_discussion d
        JOIN tbl_user u ON d.user_id = u.id
        JOIN tbl_book b ON d.book_id = b.id
        LEFT JOIN tbl_chat c ON c.discussion_id = d.id AND c.is_deleted = 0 AND c.is_active = 1
        WHERE d.is_active = 1 AND d.is_deleted = 0
        GROUP BY d.id
        ORDER BY d.created_at DESC
      `;
  
      const [result] = await conn.query(q);
  
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
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }
  
  async changeUserRole(req) {
    try {
      const { user_id, new_role } = req.body;
  
      // Check if user exists
      const checkUserQuery = `SELECT id FROM tbl_user WHERE id = ?`;
      const [userResult] = await conn.query(checkUserQuery, [user_id]);
  
      if (userResult.length === 0) {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("user_not_found") },
        };
      }
  
      // Update user role
      const updateQuery = `UPDATE tbl_user SET user_role = ? WHERE id = ?`;
      await conn.query(updateQuery, [new_role, user_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("user_role_updated_successfully") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }
  
  async clubMemberListing(req) {
    try {
      const q = `
        SELECT 
          c.id AS club_id,
          c.name AS club_name,
          b.title AS book_title,
          u.id AS user_id,
          u.name AS user_name,
          bp.completion_percentage,
          bp.progress,
          d.id AS discussion_id,
          d.title AS discussion_title
        FROM tbl_club c
        LEFT JOIN tbl_book b ON c.book_id = b.id AND b.is_active = 1 AND b.is_deleted = 0
        LEFT JOIN tbl_user_club uc ON c.id = uc.club_id AND uc.is_active = 1 AND uc.is_deleted = 0
        LEFT JOIN tbl_user u ON uc.user_id = u.id AND u.is_active = 1 AND u.is_deleted = 0
        LEFT JOIN tbl_book_progress bp 
          ON bp.user_id = u.id AND bp.book_id = c.book_id AND bp.is_active = 1 AND bp.is_deleted = 0
        LEFT JOIN tbl_discussion d 
          ON d.user_id = u.id AND d.book_id = c.book_id AND d.is_active = 1 AND d.is_deleted = 0
        WHERE c.is_active = 1 AND c.is_deleted = 0
        ORDER BY c.id, u.id
      `;

      const [result] = await conn.query(q);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("club_member_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("club_member_not_found") },
        };
      }
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async deleteUser(req) {
    try {
      let request_data = req.body;
      let user_id = request_data.user_id;

      let deleteQuery = "UPDATE tbl_user SET is_deleted = 1 WHERE id = ? AND is_active = 1 AND is_deleted = 0";
      await conn.query(deleteQuery, [user_id]);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("user_deleted") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }
  
  async userStats(req) {
    try {
      console.log("model");
       const q = `
        SELECT 
          COUNT(DISTINCT bp.book_id) AS books_read, 
          COUNT(DISTINCT u.id) as total_members,
          SUM(CASE WHEN bp.completion_percentage = 100 THEN 1 ELSE 0 END) AS completed_books,
          SUM(CASE WHEN bp.completion_percentage > 0 AND bp.completion_percentage < 100 THEN 1 ELSE 0 END) AS reading_books,
          COUNT(DISTINCT d.id) AS discussions_created
        FROM tbl_user u
        LEFT JOIN tbl_book_progress bp 
          ON u.id = bp.user_id AND bp.is_active = 1 AND bp.is_deleted = 0
        LEFT JOIN tbl_discussion d 
          ON u.id = d.user_id AND d.is_active = 1 AND d.is_deleted = 0
        WHERE u.is_active = 1 AND u.is_deleted = 0
      `;
  
      const [result] = await conn.query(q);
      console.log(result);
  
      if (result.length > 0) {
        const stats = result[0];
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("statistics_found") },
          data: {
            books_read: stats.books_read || 0,
            completed_books: stats.completed_books || 0,
            reading_books: stats.reading_books || 0,
            discussions_created: stats.discussions_created || 0,
            total_members: stats.total_members || 0
          },
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("no_statistics_found") },
        };
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async discussionDetails(req) {
    try {
      const { discussion_id } = req.body;
  
      const query = `
        SELECT 
          d.id AS discussion_id,
          d.title AS discussion_title,
          d.content AS discussion_content,
          d.created_at AS discussion_created_at,
          d.updated_at AS discussion_updated_at,
          du.id AS discussion_user_id,
          du.name AS discussion_user_name,
          b.id AS book_id,
          b.title AS book_title,
  
          c.id AS chat_id,
          c.comment,
          c.created_at AS chat_created_at,
          cu.id AS chat_user_id
  
        FROM tbl_discussion d
        JOIN tbl_user du ON d.user_id = du.id
        JOIN tbl_book b ON d.book_id = b.id
        LEFT JOIN tbl_chat c ON d.id = c.discussion_id AND c.is_active = 1 AND c.is_deleted = 0
        LEFT JOIN tbl_user cu ON c.commenting_user_id = cu.id
  
        WHERE d.id = ? AND d.is_active = 1 AND d.is_deleted = 0
  
        ORDER BY c.created_at ASC
      `;
  
      const [rows] = await conn.query(query, [discussion_id]);
  
      if (rows.length === 0) {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("discussion_not_found") },
        };
      }
  
      // Extract discussion info from the first row
      const discussionData = {
        id: rows[0].discussion_id,
        title: rows[0].discussion_title,
        content: rows[0].discussion_content,
        created_at: rows[0].discussion_created_at,
        updated_at: rows[0].discussion_updated_at,
        user_id: rows[0].discussion_user_id,
        user_name: rows[0].discussion_user_name,
        user_avatar: rows[0].discussion_user_avatar,
        book_id: rows[0].book_id,
        book_title: rows[0].book_title,
      };
  
      // Extract chats (if any)
      const chatsData = rows
        .filter(r => r.chat_id) // Remove null chats
        .map(r => ({
          id: r.chat_id,
          comment: r.comment,
          created_at: r.chat_created_at,
          user_id: r.chat_user_id,
          user_name: r.chat_user_name,
          avatar: r.chat_user_avatar
        }));
  
      // Combine all data into a single object
      discussionData.chats = chatsData;
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("discussion_found") },
        data: discussionData,
      };
  
    } catch (error) {
      console.error("Error in discussionDetails:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }
  
  async approveClubMember(req) {
    try {
      const { user_id, club_id } = req.body;
      
      const updateQuery = `
        UPDATE tbl_user_club
        SET is_approve = 1,
            updated_at = NOW()
        WHERE user_id = ? AND club_id = ? AND is_deleted = 0
      `;
  
      const [updateResult] = await conn.query(updateQuery, [user_id, club_id]);

  
      // Fetch all approved members for the club
      const approvedMembersQuery = `
        SELECT u.id, u.name, u.email
        FROM tbl_user_club uc
        JOIN tbl_user u ON u.id = uc.user_id
        WHERE uc.club_id = ? AND uc.is_approve = 1 AND uc.is_deleted = 0
      `;
  
      const [approvedMembers] = await conn.query(approvedMembersQuery, [club_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("member_approved") },
        data: approvedMembers,
      };
    } catch (error) {
      console.error("Error in approveClubMember:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: t("operation_failed") },
        error: error.message,
      };
    }
  }
  
  async removeClubMember(req) {
    try {
      const { user_id, club_id } = req.body;
      console.log("removeClubMember", user_id, club_id);
  
      const checkQuery = `
        SELECT id 
        FROM tbl_user_club
        WHERE user_id = ? AND is_deleted = 0 AND is_approve=1
      `;
  
      const [checkRows] = await conn.query(checkQuery, [user_id, club_id]);
  
      if (checkRows.length === 0) {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("membership_not_found") },
        };
      }
  
      const updateQuery = `
        UPDATE tbl_user_club
        SET is_deleted = 1, 
            is_approve = 0,
            updated_at = NOW()
        WHERE user_id = ? AND club_id = ? AND is_deleted = 0 AND is_approve=1
      `;
  
      const [result] = await conn.query(updateQuery, [user_id, club_id]);
  
      if (result.affectedRows === 0) {
        return {
          code: responseCode.OPERATION_FAILED,
          message: { keyword: t("removal_failed") },
        };
      }
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("member_removed") },
      };
    } catch (error) {
      console.error("Error in removeClubMember:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: t("operation_failed") },
        error: error.message,
      };
    }
  }





























  async allProducts(req){
    try{
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
    }catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async productDetails(req) {
    try {
      let request_data = req.body;
      let product_id = request_data.product_id;

      let q = "SELECT * FROM tbl_product WHERE id=? AND is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q, [product_id]);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("product_found") },
          data: result[0],
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("product_not_found") },
        };
      }
    }catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async addProduct(req) {
    try {
      let request_data = req.body;
      let data = {
        category_id: request_data.category_id,
        name: request_data.name,
        description: request_data.description,
        product_image: request_data.product_image,
        price: request_data.price,
      };

      let insertQuery = "INSERT INTO tbl_product SET ?";
      await conn.query(insertQuery, data);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("product_added") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async updateProduct(req) {
    try {
      const request_data = req.body;
      const product_id = request_data.product_id;
  
      
  
      let data = {};
      if (request_data.category_id !== undefined) data.category_id = request_data.category_id;
      if (request_data.name !== undefined) data.name = request_data.name;
      if (request_data.description !== undefined) data.description = request_data.description;
      if (request_data.product_image !== undefined) data.product_image = request_data.product_image;
      if (request_data.price !== undefined) data.price = request_data.price;
  
      if (Object.keys(data).length === 0) {
        return {
          code: responseCode.OPERATION_FAILED,
          message: {
            keyword: "no_data_to_update",
          },
        };
      }
  
      const updateQuery = "UPDATE tbl_product SET ? WHERE id = ?";
      await conn.query(updateQuery, [data, product_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: {
          keyword: "product_updated",
        },
      };
    } catch (error) {
      console.error("Database error in updateProduct:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: {
          keyword: error.message || "operation_failed",
        },
      };
    }
  }

  async deleteProduct(req) {
    try {
      let request_data = req.body;
  
      let product_id = request_data.product_id;
  
      let deleteQuery = "DELETE FROM tbl_product WHERE id = ? AND is_active = 1 AND is_deleted = 0";
      await conn.query(deleteQuery, [product_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("product_deleted") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async userDetails(req) {
    try {
      // let request_data = req.body;
      let user_id = req.user_id;

      let q = "SELECT * FROM tbl_user WHERE id=? AND is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q, [user_id]);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("user_found") },
          data: result[0],
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
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

  async userListing(req) {
    try {
      let q = "SELECT * FROM tbl_user WHERE is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q);

      if (result.length > 0) {
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("user_found") },
          data: result,
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
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
  
  async deleteUser(req) {
    try {
      let request_data = req.body;
      let user_id = request_data.user_id;

      let deleteQuery = "UPDATE tbl_user SET is_deleted = 1 WHERE id = ?";
      await conn.query(deleteQuery, [user_id]);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("user_deleted") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async blockUser(req) {
    try {
      let request_data = req.body;
      let user_id = request_data.user_id;


      let updateQuery = `UPDATE tbl_user SET is_active = 0 WHERE id = ? AND is_active = 1 AND is_deleted = 0;`;
      const result=await conn.query(updateQuery, [user_id]);
      console.log("result", result);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("user_blocked") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async unblockUser(req) {
    try {
      let request_data = req.body;
      let user_id = request_data.user_id;

      let updateQuery = "UPDATE tbl_user SET is_active = 1 WHERE id = ? AND is_active = 0 AND is_deleted = 0";
      await conn.query(updateQuery, [user_id]);

      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("user_unblocked") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }

  async orderDetails(req) {
    try {
      let { order_id } = req.body;
  
      let q = `
        SELECT 
          od.order_id,
          od.product_id,
          od.qty,
          p.name AS product_name,
          p.description AS product_description,
          p.price AS product_price,
          p.product_image,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.mobile AS user_phone,
          o.order_status AS order_status,
          o.address AS delivery_address,
          o.created_at
        FROM tbl_order_details od
        JOIN tbl_order o ON od.order_id = o.id
        JOIN tbl_product p ON od.product_id = p.id
        JOIN tbl_user u ON o.user_id = u.id
        WHERE od.order_id = ? AND od.is_active = 1 AND od.is_deleted = 0
      `;
  
      let [result] = await conn.query(q, [order_id]);
      console.log("result", result);
  
      if (result.length > 0) {
        let grand_total = result.reduce((total, item) => {
          return total + (item.product_price * item.qty);
        }, 0);
  
        return {
          code: responseCode.SUCCESS,
          message: { keyword: t("order_found") },
          data: result.map(item => ({
            ...item,
            grand_total
          })),
        };
      } else {
        return {
          code: responseCode.NO_DATA_FOUND,
          message: { keyword: t("order_not_found") },
        };
      }
    } catch (error) {
      console.error("Error in orderDetails:", error);
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: t("operation_failed") },
      };
    }
  }
  

  async orderListing(req) {
    try {
      let q = "SELECT * FROM tbl_order WHERE is_active=1 AND is_deleted=0";
      let [result] = await conn.query(q);

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

  async changeOrderStatus(req) {
    try {
      let request_data = req.body;
      let order_id = request_data.order_id;
      let order_status = request_data.order_status;
  
      // Fetch the current status of the order
      let currentStatusQuery = "SELECT order_status FROM tbl_order WHERE id = ? AND is_active = 1 AND is_deleted = 0";
      let [order] = await conn.query(currentStatusQuery, [order_id]);
  
      if (order.length === 0) {
        return {
          code: responseCode.NOT_FOUND,
          message: { keyword: t("order_not_found") },
        };
      }
  
      let currentStatus = order[0].order_status;
  
      if (currentStatus === 'shipped' && order_status === 'placed') {
        return {
          code: responseCode.INVALID_OPERATION,
          message: { keyword: t("cannot_change_status_to_placed_after_shipped") },
        };
      }

      if (currentStatus === 'completed' && order_status === 'shipped') {
        return {
          code: responseCode.INVALID_OPERATION,
          message: { keyword: t("cannot_change_status_to_placed_after_shipped") },
        };
      }
  
      // Proceed with the status update if the check passes
      let updateQuery = "UPDATE tbl_order SET order_status = ? WHERE id = ? AND is_active = 1 AND is_deleted = 0";
      await conn.query(updateQuery, [order_status, order_id]);
  
      return {
        code: responseCode.SUCCESS,
        message: { keyword: t("order_status_updated") },
      };
    } catch (error) {
      return {
        code: responseCode.OPERATION_FAILED,
        message: { keyword: error.message },
      };
    }
  }


  
}

module.exports = new adminModel();
