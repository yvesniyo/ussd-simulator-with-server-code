<?php

header('Access-Control-Allow-Origin: ' . "*");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$number = $_POST['phoneNumber'];
$sessionId = $_POST['sessionId'];
$text = $_POST['text'];
$code = $_POST['serviceCode'];




$mode = "menu";


$level = 1;
$ussd_array = explode("*", $text);
if (count($ussd_array) == 0) {
	$level = 0;
} else {
	$level = count($ussd_array);
}

$level = $level + 1;

if (trim($text) == "")
	$level = 1;



switch ($ussd_array[0]) {
	case '0':
		$mode = "menu";
		break;
	case '':
		$mode = "menu";
		break;
	case '1':
		$mode = "create";
		break;
	case '2':
		$mode = "balance";
		break;
	case '3':
		$mode = "sendMoney";
		break;

	default:
		# code...
		break;
}

if ($level == 1) {
	displayMenu();
} else {
	if ($mode == "menu") {
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
	} else if ($mode == "create") {
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
	} else if ($mode == "balance") {
		checkBalance();
	} else if ($mode == "sendMoney") {
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

function displayMenu()
{
	$text = "CON USSD Testing \n";
	$text .= "1. Create Account \n";
	$text .= "2. Check Balance \n";
	$text .= "3. Check My Number \n";
	$text .= "4. Send Money \n";
	$text .= "5. Buy Books \n";
	$text .= "44. Next \n";
	echo $text;
}
function createAccount()
{
	$text = "CON Creating Account\n";
	$text .= "1. Male \n";
	$text .= "2. Woman \n";
	$text .= "3. Not Now \n";
	echo $text;
}
function checkBalance()
{
	$text = "END Account Balance\n";
	$text .= "Your account Balance is 43,050Rwf \n";
	echo $text;
}
function displayError()
{
	$text = "END Error\n";
	$text .= "Uknown USSD command \n";
	echo $text;
}
function checkNumber()
{

	$text = "END Ckeck Number\n";
	$number = $_POST['phone'];
	$text .= "Your number is " . $number . " \n";
	echo $text;
}
function sendMoney()
{
	$text = "CON Send Money\n";
	$text .= "1. MTN \n";
	$text .= "2. TIGO \n";
	$text .= "3. AIRTEL \n";
	echo $text;
}
