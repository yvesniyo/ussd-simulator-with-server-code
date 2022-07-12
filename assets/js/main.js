var number = "";
var sessionId = Math.floor(Math.random() * 1009898771);
var callBack = "";
var buttons = selectorAll(".row button");
var input = selector(".input");
var loader = selector(".loading");
var keyboard = selector(".keyboard");
var ussdResult = selector(".result");
var mode = "keyboard";
var resultInput = selector(".resultInput");
var textOutput = selector(".textOutput");
var homePage = selector(".iconsPage");
var ussdPage = selector(".ussd");

selector(".delete").addEventListener("click", () => {
  remove(1);
});
selector(".resend").addEventListener("click", () => {
  resend();
});

function goHome() {
  homePage.style.display = "block";
  ussdPage.style.display = "none";
}
function goUssd() {
  homePage.style.display = "none";
  ussdPage.style.display = "block";
}

for (var a = 0; a < buttons.length; a++) {
  buttons[a].addEventListener("click", (ele) => {
    var target = ele.explicitOriginalTarget || ele.target || ele.originalTarget;
    var data = target.childNodes[0].data.trim();
    if (data === ".") {
      sendUssd(input.value);
      return;
    }
    if (mode === "keyboard") {
      input.value = input.value + "" + data;
    } else {
      resultInput.value = resultInput.value + "" + data;
    }
  });
}

function remove(len) {
  if (mode === "keyboard") {
    var data = input.value;
    data = data.substring(0, data.length - len);
    input.value = data;
  } else {
    var data = resultInput.value;
    data = data.substring(0, data.length - len);
    resultInput.value = data;
  }
}
function resend() {
  var data = input.value;
  data = data.replace("#", "*");

  newData = resultInput.value;
  if (newData.trim() === null || newData.trim() === "") {
    return;
  }
  resultInput.value = "";
  data = data + "" + newData + "#";
  input.value = data;

  sendUssd(data);
}
function resultInputsVis(state) {
  if (state) selector(".resultInputs").style.display = "block";
  else selector(".resultInputs").style.display = "none";
}
function sendUssd(data) {
  var array = data.split("*");
  array.shift();
  array.shift();

  var first = data.substring(0, 1);
  var last = data.substring(data.length - 1, data.length);

  if (
    localStorage.getItem("ussdData") !== undefined &&
    localStorage.getItem("ussdData") !== null
  ) {
    data = array.join("*");
    data = data.substring(0, data.length - 1);
    var ussdData = JSON.parse(localStorage.getItem("ussdData"));
    if (first === "*" && last === "#") {
      loading(1);
      ussdResultWithoutKeyboard();
      msg("Sending the ussd");
      let code = ussdData.code;
      code = code.replace("#", "");
      let url =
        ussdData.url +
        "?phoneNumber=" +
        ussdData.phone +
        "&sessionId=" +
        sessionId +
        "&serviceCode=" +
        code;
      url += "&text=" + data;

      console.log(url);
      setTimeout(() => {
        loadWeb(url)
          .then((output) => {
            if (text_contains(output, "CON")) {
              // server still receiving commands
              output = output.replace(/CON/g, "");
              output = output.replace(/\n/g, "<br />");
              resultInputsVis(1);
              setOutput(output);
              showResult();
            } else if (text_contains(output, "END")) {
              // server doesn't still needs the commands from user
              output = output.replace(/END/g, "");
              output = output.replace(/\n/g, "<br />");
              resultInputsVis(0);
              setOutput(output);
              showResult();
              var outEle = selector(".result");
              var button = document.createElement("button");
              button.innerHTML = "OK";
              button.classList.add("endSession");
              button.addEventListener("click", () => {
                button.remove();
                onlyKeyBoardMode();
              });
              outEle.appendChild(button);
              sessionId = Math.floor(Math.random() * 1009898771);
            } else {
              setOutput(
                "Server is not responding well <br/> make sure you use CON or END"
              );
              showResult();
              resultInputsVis(0);
              sessionId = Math.floor(Math.random() * 1009898771);
            }

            loading(0);
          })
          .catch((error) => {
            loading(0);
            onlyKeyBoardMode();
            msg(error);
            showError("There were an error!!! " + error.status);
          });
      }, 1000);
    } else {
      msg("pls use correct format of ussd");
      showError("Please use correct format of ussd");
    }
  } else {
    showError("Please first save the datas");
  }
}
var loadWeb = (url) => {
  return new Promise((resolve, reject) => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(this.responseText);
      }
      if (this.readyState == 4 && this.status !== 200) {
        reject({ status: this.status, response: this.responseText });
      }
    };
    const newUrl = new URL(url);
    const pathHost = newUrl.origin + newUrl.pathname;
    xmlhttp.open("POST", pathHost, true);

    const params = getQueryParams(url);

    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );

    let urlEncodedData = "",
      urlEncodedDataPairs = [],
      name;
    for (name in params) {
      urlEncodedDataPairs.push(
        encodeURIComponent(name) + "=" + encodeURIComponent(params[name])
      );
    }

    urlEncodedData = urlEncodedDataPairs.join("&");
    xmlhttp.send(urlEncodedData);
  });
};

function getQueryParams(qs) {
  qs = qs.trim();
  if (qs.charAt() != "?") {
    try {
      qs = new URL(qs).search;
    } catch (error) {}
  }
  qs = qs.split("+").join(" ");

  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  var data = new Object();

  for (const key of Object.keys(params)) {
    data[key] = params[key];
  }

  return data;
}

function text_contains(text, search) {
  return text.indexOf(search) !== -1;
}

function showError(data) {
  var alertMsg = selector(".alertMsg").style;
  var p = selector(".alertMsg p");
  p.innerHTML = data;
  alertMsg.display = "block";
  setTimeout(() => {
    alertMsg.display = "none";
  }, 5000);
  msg(data);
}
function setOutput(data) {
  textOutput.innerHTML = data;
}
function showResult() {
  selector(".result").style.display = "block";
}

selector(".resultInput").addEventListener("focus", resultInputFocus);

function resultInputFocus() {
  selector(".result").style.top = "10px";
  ussdResultWithKeyboard();
}
function ussdResultWithoutKeyboard() {
  typing(0, 1);
  selector(".result").style.top = "50px";
  msg("ussdResultWithoutKeyboard");
}

function ussdResultWithKeyboard() {
  typing(1, 2);

  msg("ussd Result With Keyboard");
}

selector(".cancel").addEventListener("click", () => {
  onlyKeyBoardMode();
});

function onlyKeyBoardMode() {
  closeUssdResult();
  typing(1, 1);
  input.value = "";
  msg("onlyKeyBoardMode");
}
function closeUssdResult() {
  selector(".result").style.display = "none";
}

function loading(state) {
  if (state === 1) {
    closeUssdResult();
    loader.style.display = "block";
  } else {
    loader.style.display = "none";
  }
}
function msg(message) {
  console.log(message);
}

function selector(element) {
  return document.querySelector(element);
}
function selectorAll(element) {
  return document.querySelectorAll(element);
}

function typing(state, version) {
  if (version === 1) {
    mode = "keyboard";
    selector(".input").style.display = "block";
    selector(".send").style.display = "block";
    if (state === 1) {
      keyboard.style.display = "block";
    } else {
      keyboard.style.display = "none";
    }
  } else if (version === 2) {
    mode = "onlyKeyboard";
    selector(".input").style.display = "none";
    selector(".send").style.display = "none";
    if (state === 1) {
      keyboard.style.display = "block";
    } else {
      keyboard.style.display = "none";
    }
  }
}

function clock() {
  var date = new Date();
  var hours = date.getDate();
  var munites = date.getMinutes();
  var seconds = date.getSeconds();
  var time = hours + ":" + munites + ":" + seconds;
  selector(".clock").innerHTML = time;
}

setInterval(clock, 1000);

var codes = `
header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$number=$_REQUEST['phoneNumber'];
$sessionId=$_REQUEST['sessionId'];
$text=$_REQUEST['text'];
$code=$_REQUEST['serviceCode'];




$mode="menu";


$level = 1;
$ussd_array = explode ("*",$text);
if(count($ussd_array)==0){
	$level=0;
}else{
	$level=count($ussd_array);
}

$level=$level+1;

if(trim($text)=="")
	$level=1;



switch ($ussd_array[0]) {
	case '0':
		$mode="menu";
		break;
	case '':
		$mode="menu";
		break;
	case '1':
		$mode="create";
		break;
	case '2':
		$mode="balance";
		break;
	case '3':
		$mode="sendMoney";
		break;
	
	default:
		# code...
		break;
}

if($level==1){
	displayMenu();
}else{
	if($mode=="menu"){
		switch ($text) {
			case '0':
				displayMenu();
				break;
			case '1':
				createAccount();
				break;
			case '2':
				checkBalance();
				break;
			case '3':
				checkNumber();
				break;
			case '4':
				sendMoney();
				break;
			
			default:
				displayError();
				break;
		}
	}else if($mode=="create"){
		switch ($text) {
			case '1':
				createAccount();
				break;
			case '1*1':
				echo "END You choose \n Male";
				break;
			case '1*2':
				echo "END You choose \n Female";
				break;
			case '1*3':
				echo "END You choose \n Not Now";
				break;
			
			default:
				displayError();
				break;
		}

	}else if($mode=="balance"){
		checkBalance();

	}else if($mode=="sendMoney"){
		switch ($text) {
			case '3':
				sendMoney();
				break;
			case '3*1':
				echo "END You choose \n MTN";
				break;
			case '3*2':
				echo "END You choose \n AIRTEL";
				break;
			case '3*3':
				echo "END You choose \n TIGO";
				break;
			
			default:
				displayError();
				break;
		}

	}
}





function displayMenu(){
	$text="CON USSD Testing \n";
	$text.="1. Create Account \n";
	$text.="2. Check Balance \n";
	$text.="3. Check My Number \n";
	$text.="4. Send Money \n";
	$text.="5. Buy Books \n";
	$text.="44. Next \n";
	echo $text;
}
function createAccount(){
	$text="CON Creating Account\n";
	$text.="1. Male \n";
	$text.="2. Woman \n";
	$text.="3. Not Now \n";
	echo $text;
}
function checkBalance(){
	$text="END Account Balance\n";
	$text.="Your account Balance is 43,050Rwf \n";
	echo $text;
}
function displayError(){
	$text="END Error\n";
	$text.="Uknown USSD command \n";
	echo $text;
}
function checkNumber(){
	
	$text="END Ckeck Number\n";
	$number=$_REQUEST['phone'];
	$text.="Your number is ".$number." \n";
	echo $text;
}
function sendMoney(){
	$text="CON Send Money\n";
	$text.="1. MTN \n";
	$text.="2. TIGO \n";
	$text.="3. AIRTEL \n";
	echo $text;
}`;

//settings js
check();
selector(".save").addEventListener("click", save);
function save() {
  var phone = selector(".phoneNumber").value;
  var url = selector(".url").value;
  var code = selector(".code").value;
  var ussdData = {
    phone: phone,
    url: url,
    code: code,
    sessionId: 0,
  };
  localStorage.setItem("ussdData", JSON.stringify(ussdData));
  selector(".alert").style.display = "block";
  setTimeout(() => {
    selector(".alert").style.display = "none";
  }, 5000);
}
function check() {
  if (
    localStorage.getItem("ussdData") !== undefined &&
    localStorage.getItem("ussdData") !== null
  ) {
    var ussdData = JSON.parse(localStorage.getItem("ussdData"));
    selector(".phoneNumber").value = ussdData.phone;
    selector(".url").value = ussdData.url;
    selector(".code").value = ussdData.code;
  }
}
selector(".copy").addEventListener("click", () => {
  copyToClipboard(codes);
});

const copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

selector(".goSettings").addEventListener("click", () => {
  selector(".codes").style.display = "none";

  selector(".tempCont").style.display = "block";
});
selector(".goCodes").addEventListener("click", () => {
  selector(".codes").style.display = "block";

  selector(".tempCont").style.display = "none";
});
