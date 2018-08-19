const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // body-parser은 POST요청 데이터를 추출하는 미들웨어.
const methodOverride = require("method-override");
const flash = require("connect-flash"); // 변수처럼 이름을 정하고 값(문자열, 숫자, 배열, 객체 등등 어떠한 형태의 값이라도 사용 가능)을 저장할 수 있는데, 한번 생성 되면 사용될 때까지 서버에 저장이 되어 있다가 한번 사용되면 사라지는 형태의 data
const session = require("express-session");
const passport = require("./config/passport");
const app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB, {
    promiseLibrary: global.Promise
});
const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");
});
db.on("error", (err) => {
    console.log("DB ERROR : ", err);
});

// Other settings
// 미들웨어 설정
/* ejs를 사용하기 위해서 express의 view engine에 ejs를 set */
app.set("view engine", "ejs");

/* app.use는 HTTP method에 상관없이 무조건 실행하는 부분. 
__dirname은 node.js에서 프로그램이 실행중인 파일의 위치를 나타내는 global variable.
=> 현재위치 /public을 static폴더로 지정
'/'에 접속하면 '/public'에, '/css'에 접속하면 '/public/css'에 접속 */
app.use(express.static(__dirname + "/public")); 

/* bodyParser로 stream의 form data를 req.body에 옮김. */
app.use(bodyParser.json()); // json data를
app.use(bodyParser.urlencoded({ // urlencoded data를 분석
    extended: true
})); 
// true를 해줘야함. extended 는 중첩된 객체표현을 허용할지 말지를 정하는 것. 
//객체 안에 객체를 파싱할 수 있게하려면 true.

app.use(methodOverride("_method"));
// req.flash(문자열, 저장할_값) 의 형태로 저장할_값을 문자열에 저장.
// req.flash(문자열) 인 경우 해당 문자열에 저장된 값들을 배열로 불러옴. 
// 저장된 값이 없다면 빈 배열([])을 return.
app.use(flash()); // flash를 초기화
app.use(session({
    secret: "MySecret",
    saveUninitialized: true,
    resave: true
})); // 서버에서 접속자를 구분시키는 역할.

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
// res.locals에 isAuthenticated,currentUser이 있어서 views/posts/index.ejs에서 바로 사용할 수 있음.
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
})

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

// Port setting ...
app.listen(4000, () => {
    console.log("server on!");
});
