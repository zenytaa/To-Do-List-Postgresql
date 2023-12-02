import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  password: "xxxxxx",
  database: "permalist",
  host: "localhost",
  port: 5432,
});
db.connect();

async function getListItem() {
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  const listItems = [];
  result.rows.forEach((item) => {
    listItems.push(item);
  });
  return listItems;
}

app.get("/", async (req, res) => {
  try {
    const listItems = await getListItem();
    // console.log("getItemList : ", listItems);
    res.render("index.ejs", {
      listTitle: "Today",
      listItems,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    const sql = "INSERT INTO items (title) VALUES ($1)";
    await db.query(sql, [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const updateTitle = req.body.updatedItemTitle;
  // console.log("currentId after edit", id);
  // console.log("currentTitle after edit", updateTitle);
  try {
    const sql = "UPDATE items SET title = ($1) WHERE id = ($2)";
    await db.query(sql, [updateTitle, id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    const sql = "DELETE FROM items WHERE id = ($1)";
    await db.query(sql, [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
