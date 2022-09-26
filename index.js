const express = require("express");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const PORT = 5002;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function runPythonScript() {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["dataMasking.py"]);
  // collect data from script
  return new Promise((resolve, reject) => {
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", (code) => {
      // console.log(`child process close all stdio with code ${code}`);
      // send data to browser
      var buffer = fs.readFileSync("data/output/news.txt");
      resolve(buffer.toString());
    });
  });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "data/input");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    // var filetypes = /jpeg|jpg|png|text|plain|pdf/;
    var filetypes = ["text/plain", ".txt"];

    var mimetype = filetypes.includes(file.mimetype);

    var extname = filetypes.includes(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
        "following filetypes - " +
        filetypes
    );
  },

  // mypic is the name of file attribute
});

app.post("/upload_files", upload.array("files"), uploadFiles);

app.post("/input_text", async (req, res) => {
  // var path = process.cwd();

  const { text } = req.body;
  fs.writeFileSync("data/input/news.txt", text);
  const masked = await runPythonScript();
  res.send(masked);
});

app.get("/", (req, res) => {
  res.send("welcome");
});

async function uploadFiles(req, res) {
  const text = await runPythonScript();
  res.send(text);
}
app.listen(PORT, () => {
  console.log(`Server started runnig on`, PORT);
});
