const controler = require("../controler");
const pool = require("../../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = new (class extends controler {
  async userNotes(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM notes WHERE username = $1",
        [req.user.username]
      );
      this.response(res, "user notes", result.rows, null, 201);
    } catch (error) {
      this.response(res, "server error", null, { error: "خطای سرور" }, 500);
    }
  }

  async deleteNote(req, res) {
    const { post_id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM notes WHERE username = $1 AND id = $2 RETURNING *",
        [req.user.username, post_id]
      );

      if (result.rows.length === 0) {
        this.response(
          res,
          "deleting note error",
          null,
          "چنین یادداشتی وجود ندارد",
          404
        );
        return;
      }

      this.response(res, "با موفقیت حذف شد", null, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "server خطای سرو", 500);
    }
  }

  async searchUsers(req, res) {
    const { username } = req.query;

    try {
      const result = await pool.query(
        `SELECT id,username FROM users WHERE username LIKE '${username}%'  AND username != $1 `,
        [req.user.username]
      );

      this.response(res, "search users", result.rows, null);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async addNote(req, res) {
    const { title, content, time, date, direction } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO notes (title,content, username,time,date,direction) VALUES ($1, $2, $3, $4, $5,$6)",
        [title, content, req.user.username, time, date, direction]
      );

      this.response(res, "یادداشت با موفقیت افزوده شده", null, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async editNote(req, res) {
    const { post_id, title, content, time, date, direction } = req.body;
    try {
      const result = await pool.query(
        "UPDATE notes SET title = $3 , content = $4 , time = $5 , date = $6 , direction = $7 WHERE id= $1 AND username = $2 RETURNING *;",
        [post_id, req.user.username, title, content, time, date, direction]
      );

      if (result.rows.length === 0) {
        this.response(res, "Error", null, "چنین یادداشتی وجود ندارد", 400);
        return;
      }

      this.response(res, "یادداشت با موفقیت ویرایش شد", null, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async deleteNotes(req, res) {
    try {
      const deletedNotes = await pool.query(
        "DELETE FROM notes WHERE username = $1",
        [req.user.username]
      );
      this.response(res, "یادداشت ها با موفقیت حذف شد", null, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async userFriends(req, res) {
    try {
      const result = await pool.query(
        "SELECT   id,  CASE   WHEN receiver_username = $1 THEN sender_username ELSE receiver_username END AS friend_username FROM friend_requests WHERE (sender_username = $1 OR receiver_username = $1) AND status = 'accepted'",
        [req.user.username]
      );
      this.response(res, "user's friends", result.rows, null);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async deleteFriendRequest(req, res) {
    const { friendRequestID } = req.body;
    console.log("x");
    try {
      const result = await pool.query(
        "DELETE FROM friend_requests WHERE ID = $1",
        [friendRequestID]
      );

      this.response(
        res,
        `The friend requested deleted successfully`,
        null,
        null
      );
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async friendRequest(req, res) {
    const { receiver_username } = req.body;

    try {
      const result = await pool.query(
        "INSERT INTO  friend_requests (sender_username,receiver_username,status) VALUES ($1,$2,$3)",
        [req.user.username, receiver_username, "pending"]
      );

      this.response(res, `درخواست با موفقیت ارسال شد`, null, null, 201);
    } catch (error) {
      console.error(error);
      if (error.code === "23505") {
        this.response(
          res,
          "friend request error",
          null,
          "درخواست شما برای این کاربر ارسال شده است",
          400
        );
        return;
      }
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }
  async pendingRequest(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM friend_requests WHERE sender_username = $1 AND status = 'pending' ",
        [req.user.username]
      );
      this.response(res, "pending requests", result.rows, null);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async getNotifications(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM friend_requests WHERE receiver_username = $1 AND status != 'accepted' ",
        [req.user.username]
      );
      this.response(res, "notifications", result.rows, null);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async acceptFriendRequest(req, res) {
    const { friendRequestID } = req.body;

    try {
      const result = await pool.query(
        "UPDATE friend_requests SET status= 'accepted' WHERE id = $1",
        [friendRequestID]
      );
      this.response(res, "friends list updated", null, null);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async shareNote(req, res) {
    const { sharingNoteID, friendUsername } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO shared_notes (shared_user,note_id) VALUES ($1,$2)",
        [friendUsername, sharingNoteID]
      );
      this.response(res, "note shared successfully", null, null);
    } catch (error) {
      console.error(error);
      if (error.code === "23505") {
        this.response(
          res,
          "sharing note errro",
          null,
          "این یادداشت برای این کاربر ارسال شده است",
          400
        );
        return;
      }
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }

  async getSharedNotes(req, res) {
    try {
      const result = await pool.query(
        "SELECT notes.* FROM notes JOIN shared_notes ON notes.id = shared_notes.note_id WHERE shared_notes.shared_user = $1",
        [req.user.username]
      );
      this.response(res, "Notes fetched successfully", result.rows, null, 201);
    } catch (error) {
      this.response(res, "server error", null, "خطای سرور", 500);
    }
  }
})();
