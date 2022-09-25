const express = require("express");
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const path = require("path")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "/Nft/clinical-dataMasking-backend/data/input");
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname  );
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
    var filetypes = ["text/plain",".txt"];

    var mimetype = filetypes.includes(file.mimetype);

    var extname = filetypes.includes(path.extname(file.originalname).toLowerCase());

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
})


app.post("/upload_files", upload.array("files"), uploadFiles);

app.get("/", (req, res) => {
  res.send("welcome");
});

function uploadFiles(req, res) {
  console.log(req.body);
  console.log(req.files);
  res.json({ message: "Successfully uploaded files" });
}
app.listen(5000, () => {
  console.log(`Server started...`);
});
