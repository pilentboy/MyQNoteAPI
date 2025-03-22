const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();
const auth=require("./authenticate")


// check api key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "API key is missing" });
  }
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};

const app = express();

// configs
app.use(bodyParser.json());
app.use(checkApiKey);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key"
  );

  next();
});

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key"
  );
  res.sendStatus(200);
});



// Routes
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);

    res.status(500).send("Error retrieving data");
  }
});




app.get("/search_users",auth, async (req, res) => {
	 const { username } = req.query;
	

  try {
    const result = await pool.query(`SELECT * FROM users WHERE username LIKE '${username}%'  AND username != $1 `,[req.user.username]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);

    res.status(500).send("Error retrieving data");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  
  
  // set body errors 
  const error = { error: [] };

  // checking body
  if (!username || !password) {
    error.error.push({
      required_values: "نام کاربری یا رمز عبور نمی تواند خالی باشد.",
    });
  }

  if (password?.length < 8 || password?.length > 16) {
    error.error.push({
      password_length: "رمز عبور باید بین 8 تا 16 کاراکتر باشد.",
    });
  }

  if (error.error.length > 0) {
    return res.status(400).json(error);
  }
  // end checking body

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json(
       { error: "کاربری با این نام کاربری وجود دارد." },
      );
    }
    res.status(500).json({ error: "خطای سرور" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
	console.log('redddd')
  // checking body
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "نام کاربری و رمز عبور نمی تواند خالی باشد." });
  }
  // end checking body

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ error: "نام کاربری یا رمز عبور اشتباه است." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "200d",
      }
    );
	
	
	// delete user's current access key if there's one
	//const deletePreToken=await pool.query("DELETE FROM access_key WHERE user_id = $1",[user.id])
	
	const setToken=await pool.query("INSERT INTO access_key (key,user_id) VALUES ($1,$2)",[token,user.id])
	
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطای سرور" });
  }
});

app.post("/add_note", auth,async (req, res) => {
  const { title, content, time , date ,direction} = req.body;


  // checking body
	if (!title || !content) {
		return res
		.status(400)
		json({ error: "عنوان و یادداشت نمی توانند خالی باشند." });
	}
	// end checking body
	try {
		const result = await pool.query(
		"INSERT INTO notes (title,content, username,time,date,direction) VALUES ($1, $2, $3, $4, $5,$6)",
		[title, content, req.user.username,time,date,direction]
		);

    res.status(201).json({ message: "یادداشت با موفقیت افزوده شده" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطای سرور" });
  }
});

app.get("/user_notes",auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notes WHERE username = $1", [
      req.user.username,
    ]);

   /* if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "یادداشتی برای این کاربر پیدا نشد." });
    }*/

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطای سرور" });
  }
});

app.delete("/delete_note/:post_id",auth, async (req, res) => {
  const {post_id } = req.params;
	
  try {
    const result = await pool.query(
      "DELETE FROM notes WHERE username = $1 AND id = $2 RETURNING *",
      [req.user.username, post_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "چنین یادداشتی وجود ندارد." });
    }
	
	

    res.status(201).json({ message: "یادداشت با موفقیت حذف شد." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطای سرور" });
  }
});


app.put("/edit_note",auth, async (req, res) => {
   const {post_id, title, content, time , date ,direction} = req.body;
	
  try {
    const result = await pool.query(
  "UPDATE notes SET title = $3 , content = $4 , time = $5 , date = $6 , direction = $7 WHERE id= $1 AND username = $2 RETURNING *;",
      [post_id,req.user.username,title,content,time,date,direction]
    );
	
	console.log(result.rows)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "چنین یادداشتی وجود ندارد." });
    }

    res.status(201).json({ message: "یادداشت با موفقیت ویرایش شد" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطای سرور" });
  }
});


app.delete("/delete_notes",auth,async (req,res) => {
	
	try{
		const deletedNotes=await pool.query("DELETE FROM notes WHERE username = $1",[req.user.username])
		res.status(201).json({message:"all user notes deleted successfully"})
	}catch(error){
		console.log(error)
		res.status(500).json({error:error})
	}
	
});


app.post("/friend_request", auth,async (req, res) => {
  const {receiver_username} = req.body;
	

  // checking body
	if (!receiver_username) {
		return res
		.status(400)
		json({ error: "اطلاعات ارسال شده صحیح نمی باشند." });
	}
	// end checking body
	try {
		
		const result = await pool.query(
		"INSERT INTO  friend_requests (sender_username,receiver_username,status) VALUES ($1,$2,$3)",
		[req.user.username,receiver_username,"pending"]
		);

    res.status(201).json({ message: "درخواست با موفقیت ارسال شد" });
  } catch (error) {
    console.error(error);
	if (error.code === "23505") {
      return res.status(400).json(
       { error: "درخواست شما برای این کاربر ارسال شده است" },
      );
    }
    res.status(500).json({ error: "server error" });
  }
});


app.get("/notification", auth,async (req, res) => {
	const {receiver_username} = req.body;

	try {	
		const result = await pool.query(
		"SELECT * FROM friend_requests WHERE receiver_username = $1 AND status != 'accepted' ",[req.user.username]
		);
	console.log(result.rows)
    res.json({notifications:result.rows, message: "notifications" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});


app.delete("/delete_friend_request", auth,async (req, res) => {
	const {friendRequestID} = req.body;


	try {	
		const result = await pool.query(
		"DELETE FROM friend_requests WHERE ID = $1",[friendRequestID]
		);
	
    res.json({message: `The friend request deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});


app.get("/pending_requests", auth,async (req, res) => {

	try {	
		const result = await pool.query(
		"SELECT * FROM friend_requests WHERE sender_username = $1 AND status = 'pending' ",[req.user.username]
		);
		console.log(result)
    res.json({pendingRequests:result.rows,message: `friend requests` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});


app.get("/user_friends", auth,async (req, res) => {

	try {	
		const result = await pool.query(
		"SELECT   id,  CASE   WHEN receiver_username = $1 THEN sender_username ELSE receiver_username END AS friend_username FROM friend_requests WHERE (sender_username = $1 OR receiver_username = $1) AND status = 'accepted'",[req.user.username]	);
		console.log(result)
    res.json({userFriends:result.rows,message: `user's friends` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.put("/accept_friend_request", auth,async (req, res) => {
	const {friendRequestID} = req.body;
	try {	
		const result = await pool.query(
		"UPDATE friend_requests SET status= 'accepted' WHERE id = $1",[friendRequestID]
		);
		console.log(result)
    res.json({message: "friends list updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/share_note", auth,async (req, res) => {
	const {sharingNoteID,friendUsername} = req.body;
	try {	
		const result = await pool.query(
		"INSERT INTO shared_notes (shared_user,note_id) VALUES ($1,$2)",[friendUsername,sharingNoteID]
		);
		console.log(result)
    res.json({message: "note shared successfully" });
  } catch (error) {
	 console.error(error);
	if (error.code === "23505") {
      return res.status(400).json(
       { error: "این یادداشت برای این کاربر ارسال شده است" },
      );
    }
    res.status(500).json({ error: "server error" });
  
  }
});

app.get("/user_shared_notes", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT notes.* FROM notes JOIN shared_notes ON notes.id = shared_notes.note_id WHERE shared_notes.shared_user = $1",
      [req.user.username]
    );
    console.log(result);
    res.json({ notes: result.rows, message: "Notes fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// Start the server÷
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
