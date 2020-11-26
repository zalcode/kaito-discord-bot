import express from "express";
import bodyParser from "body-parser";
import { startBot } from "./bot";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: "OK", date: new Date() });
});

startBot();

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
