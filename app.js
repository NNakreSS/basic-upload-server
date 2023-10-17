import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import Upload from "./src/upload.js";

const app = express();
const upload = new Upload();

const PORT = process.env.PORT || 3000;

app.use(helmet()); // secure connection
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.uploadFile);

app.get("/uploads/:token", upload.getFile);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
