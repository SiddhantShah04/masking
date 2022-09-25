const express = require("express");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const path = require("path");
const { spawn } = require("child_process");

const PORT =5000

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.send("welcome");
});

function uploadFiles(req, res) {

  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["dataMasking.py"]);
  // collect data from script
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on("close", (code) => {
    // console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend);
  });
}
app.listen(PORT, () => {
  console.log(`Server started runnig on`,PORT);
});
