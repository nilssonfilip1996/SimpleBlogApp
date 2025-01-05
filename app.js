import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3002;
var isUserSignedIn = false;
const adminEmail = "admin@blog.se";
const superSecretPassword = "password"

var entries= [];
import * as fs from 'fs';
populateDummyArray();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

/* Get-request for the main-page. */
app.get("/", (req, res) => {
    res.render("index.ejs", {allEntries: entries, signedIn: isUserSignedIn});
});

/* Get-request when the user presses logout. */
app.get("/logOut", (req, res) => {
  isUserSignedIn = false;
  res.redirect("/");
});

/* Post-request when the user presses login. */
app.post("/logIn", (req, res) => {
    if(validatePassword(req.body["inpEmail"], req.body["inpPassword"])){
        isUserSignedIn = true;
        res.redirect("/");
    }
    else{
        res.render("index.ejs", {allEntries: entries, signedIn: isUserSignedIn, showLoginModal: true});
    }
    
});

/* Get-request when the user whiches to make a new blog-entry. */
app.get("/create", (req, res) => {
    res.render("createEntry.ejs", {signedIn: isUserSignedIn});
});

/* Get-request for the about page. */
app.get("/about", (req, res) => {
    res.render("about.ejs", {signedIn: isUserSignedIn});
});

/* Post-request when the user submits a new blog-entry. */
app.post("/addEntry", (req, res) => {
    var date = new Date().toUTCString();
    entries.unshift(new blogEntry(req.body["entryTitel"], req.body["entryText"], date));
    res.redirect("/");
});

/* Post-request when the user wishes to edit an existing entry. 
   Renders the editEntry.ejs view with the chosen blog entry.
*/
app.post("/edit/:id", (req, res) => {
    const requestedId = req.params.id;
    res.render("editEntry.ejs", {entryId: requestedId, entry: entries[requestedId],signedIn: isUserSignedIn});
});

/* Post-request when the user submits a change to an existing blog-entry. */
app.post("/updateEntry/:id", (req, res) => {
    const requestedId = req.params.id;
    entries[requestedId].titel = req.body["titelInput"];
    entries[requestedId].text = req.body["textInput"];
    res.redirect("/");
});

/* Post-request when the user wishes to delete an existing blog-entry. 
   Removes the chosen entry from the entries array.
*/
app.post("/delete/:id", (req, res) => {
    const requestedId = req.params.id;
    entries.splice(requestedId, 1);
    res.redirect("/");
});

/* Start the Expess.js server. */
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

/* blogEntry object. */
function blogEntry(titel, text, date){
    this.titel = titel;
    this.text = text;
    this.date = date;
};

/* Populate the entries array with dummy entries. For testing purposes.*/
function populateDummyArray(){
    let openJSON = fs.readFileSync('dummyEntries.json', 'utf-8');
    let parseJSON = JSON.parse(openJSON);

    for(let i = 0; i < parseJSON.length; i++){ 
        var item = parseJSON[i];
        entries.push(new blogEntry(item.title, item.text, item.date));
    }
};

/* Basic email and password verification. */
function validatePassword(email, password){
    if((email === adminEmail) && (password === superSecretPassword)){
        return true;
    }
    else{
        return false;
    }
};